#!/usr/bin/env node
//
// Boots a candidate build on hosted JBrowse releases with the jb2hubs configs
// that name this plugin's `latest/` bundle, and fails if any session error-pages
// or never defines the plugin global. v4.3.0 loads that url too, so a release
// importing something v4.3.0 does not re-export takes down its hg19 and hg38
// sessions.
//
// Usage:
//   node scripts/host-compat-probe.mjs --bundle dist/jbrowse-plugin-ucsc.umd.production.min.js
//   node scripts/host-compat-probe.mjs --bundle … --versions v4.3.0,main --configs hg38
//
import crypto from 'node:crypto'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { parseArgs } from 'node:util'

import { launch } from 'puppeteer-core'

const DEFAULT_VERSIONS = ['v4.3.0', 'latest', 'main']

const CONFIGS = {
  hg38: 'https://jbrowse.org/ucsc/hg38/config.json',
  hg19: 'https://jbrowse.org/ucsc/hg19/config.json',
}
const PLUGIN_GLOBAL = 'JBrowsePluginUCSC'
const PACKAGE_PATH = '/jbrowse-plugin-ucsc/'

function findChrome() {
  const candidates = [
    process.env.CHROME_PATH,
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
    '/usr/bin/chromium-browser',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    ...fs
      .globSync(
        path.join(os.homedir(), '.cache/puppeteer/chrome/*/chrome-*/chrome'),
      )
      .sort()
      .reverse(),
  ].filter(Boolean)
  const found = candidates.find(c => fs.existsSync(c))
  if (!found) {
    throw new Error(
      `no browser found; set CHROME_PATH. Looked in: ${candidates.join(', ')}`,
    )
  }
  return found
}

const { values } = parseArgs({
  options: {
    bundle: { type: 'string' },
    versions: { type: 'string' },
    configs: { type: 'string' },
    timeout: { type: 'string', default: '90000' },
    json: { type: 'string' },
  },
})
if (!values.bundle) {
  throw new Error('--bundle <path to built umd> is required')
}
const versions = values.versions?.split(',') ?? DEFAULT_VERSIONS
const configNames = values.configs?.split(',') ?? Object.keys(CONFIGS)
const timeout = Number(values.timeout)
const bundle = fs.readFileSync(values.bundle, 'utf8')
const bundleDir = path.dirname(values.bundle)
const mainName = path.basename(values.bundle)
const bundleIntegrity = `sha384-${crypto.createHash('sha384').update(bundle).digest('base64')}`

// a v5 host resolves `storePlugin` through the store manifest, which pins the
// published bundle's integrity hash; the candidate needs its own
function withCandidateIntegrity(value) {
  if (Array.isArray(value)) {
    return value.map(withCandidateIntegrity)
  }
  if (typeof value === 'object' && value !== null) {
    const out = Object.fromEntries(
      Object.entries(value).map(([key, item]) => [
        key,
        withCandidateIntegrity(item),
      ]),
    )
    return typeof out.url === 'string' &&
      out.url.includes(PACKAGE_PATH) &&
      'integrity' in out
      ? { ...out, integrity: bundleIntegrity }
      : out
  }
  return value
}

async function storeManifest(url) {
  const response = await fetch(url)
  return JSON.stringify(withCandidateIntegrity(await response.json()))
}

// serves the whole local dist: a code-split build fetches sibling chunks by
// their own names, and answering those with the main bundle fakes a failure
async function serveCandidate(page) {
  await page.setRequestInterception(true)
  page.on('request', req => {
    const url = req.url()
    const { pathname } = new URL(url)
    if (pathname.startsWith('/plugin-store/') && pathname.endsWith('.json')) {
      storeManifest(url)
        .then(body =>
          req.respond({
            status: 200,
            contentType: 'application/json',
            headers: { 'Access-Control-Allow-Origin': '*' },
            body,
          }),
        )
        .catch(() => req.continue().catch(() => {}))
    } else {
      const name = path.basename(pathname)
      const sibling = path.join(bundleDir, name)
      const isPluginAsset = url.includes(PACKAGE_PATH) && name.endsWith('.js')
      const body = !isPluginAsset
        ? undefined
        : name !== mainName && fs.existsSync(sibling)
          ? fs.readFileSync(sibling, 'utf8')
          : bundle
      if (body === undefined) {
        req.continue().catch(() => {})
      } else {
        req
          .respond({
            status: 200,
            contentType: 'application/javascript',
            headers: { 'Access-Control-Allow-Origin': '*' },
            body,
          })
          .catch(() => {})
      }
    }
  })
}

async function probeOne(browser, version, configName) {
  const page = await browser.newPage()
  await serveCandidate(page)
  const consoleErrors = []
  page.on('console', m => {
    if (m.type() === 'error') {
      consoleErrors.push(m.text().slice(0, 300))
    }
  })
  page.on('pageerror', e => {
    consoleErrors.push(`pageerror: ${String(e).slice(0, 300)}`)
  })

  const result = { version, config: configName, consoleErrors }
  try {
    const config = CONFIGS[configName]
    const url = `https://jbrowse.org/code/jb2/${version}/?config=${encodeURIComponent(config)}`
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 60_000 })

    // the loading spinner is an svg, so waiting on markup returns before the
    // plugins load; wait for the session global or the error page instead
    result.settled = await page
      .waitForFunction(
        () =>
          !!(window.JBrowseSession ?? window.__jbrowse_session) ||
          /JBrowse Error|Fatal error/.test(document.body.innerText),
        { timeout },
      )
      .then(() => true)
      .catch(() => false)

    result.appError = await page.evaluate(() => {
      const t = document.body.innerText
      return t.includes('JBrowse Error') || t.includes('Fatal error')
        ? t.split('\n').slice(0, 4).join(' | ').slice(0, 300)
        : undefined
    })

    // main keeps a failed plugin's global as a key holding undefined, so `in`
    // passes a bundle that threw
    result.globalDefined = await page.evaluate(
      name => window[name] != null,
      PLUGIN_GLOBAL,
    )
  } catch (e) {
    result.threw = String(e).slice(0, 300)
  }
  await page.close()
  return result
}

function failure(r) {
  return r.appError
    ? `SESSION FAILED: ${r.appError}`
    : r.threw
      ? `probe threw: ${r.threw}`
      : r.settled
        ? r.globalDefined
          ? undefined
          : `${PLUGIN_GLOBAL} is undefined (the bundle threw while evaluating)`
        : 'never settled (no session and no error page)'
}

const browser = await launch({
  headless: true,
  executablePath: findChrome(),
  args: ['--no-sandbox'],
  defaultViewport: { width: 1400, height: 900 },
})

console.log(`serving ${values.bundle} as the UCSC plugin`)
const results = []
for (const configName of configNames) {
  console.log(`\n${configName}: ${CONFIGS[configName]}`)
  for (const version of versions) {
    const r = await probeOne(browser, version, configName)
    results.push(r)
    const bad = failure(r)
    console.log(`  ${version.padEnd(10)} ${bad ?? 'ok'}`)
    if (bad) {
      for (const e of [...new Set(r.consoleErrors)].slice(0, 4)) {
        console.log(`             · ${e}`)
      }
    }
  }
}
await browser.close()

if (values.json) {
  fs.writeFileSync(values.json, JSON.stringify(results, null, 2))
}

const broken = results.filter(r => failure(r))
if (broken.length > 0) {
  console.error(
    `\nFailed on: ${broken.map(r => `${r.config}@${r.version}`).join(', ')}`,
  )
  process.exit(1)
}
console.log('\nAll probed hosts loaded the bundle.')
