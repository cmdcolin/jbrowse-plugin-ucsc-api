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
