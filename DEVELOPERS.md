## Using the plugin in @jbrowse/react-linear-genome-view

```
pnpm add jbrowse-plugin-ucsc
```

```tsx
import {
  createViewState,
  JBrowseLinearGenomeView,
} from '@jbrowse/react-linear-genome-view'
import UCSC from 'jbrowse-plugin-ucsc'

function View() {
  const state = createViewState({
    assembly: {/* assembly */},
    tracks: [/* tracks */],
    plugins: [UCSC],
  })
  return <JBrowseLinearGenomeView viewState={state} />
}
```

## Changing the plugin

```
pnpm install
pnpm start
```

`pnpm start` serves the plugin and [config.json](config.json) on port 9000. Open
them in a JBrowse Web build, such as
`https://jbrowse.org/code/jb2/latest/?config=http://localhost:9000/config.json`.

`pnpm format` formats with oxfmt. `pnpm typecheck` (tsrs), `pnpm lint`
(type-aware oxlint) and `pnpm test` check a change; `pnpm version` runs them,
`pnpm format:check` and the build first.

The tests read trimmed API responses in `src/UCSCAdapter/__fixtures__/`. To
refresh one, fetch the track again, for example:

```
curl 'https://api.genome.ucsc.edu/getData/track?genome=hg38;track=knownGene;chrom=chr1;start=998000;end=1001000'
```

## Hosts a release reaches

The jb2hubs hg19 and hg38 configs name this plugin's `latest/` UMD, and JBrowse
4.3.0 loads that url as well as v5 hosts do. A release that imports anything
v4.3.0 does not re-export would make every v4.3.0 hg19 or hg38 session fail to
load, so keep the imports to the ones every host since v2.0.0 provides.

`pnpm host-compat` boots `dist/` with the hg19 and hg38 configs on v4.3.0, the
latest release and `main`, and fails if a session error-pages or the plugin
never loads. `pnpm version` and every push run it. It needs Chrome: set
`CHROME_PATH` if it does not find one.
