## To use in @jbrowse/react-linear-genome-view

```
yarn add jbrowse-plugin-ucsc
```

Then add

```tsx
import React from "react";
import "fontsource-roboto";
import {
  createViewState,
  createJBrowseTheme,
  JBrowseLinearGenomeView,
  ThemeProvider,
} from "@jbrowse/react-linear-view";
import UCSC from "jbrowse-plugin-ucsc";

const theme = createJBrowseTheme();

function View() {
  const state = createViewState({
    assembly: {
      /* assembly */
    },
    tracks: [
      /* tracks */
    ],
    plugins: [UCSC],
  });
  return (
    <ThemeProvider theme={theme}>
      <JBrowseLinearGenomeView viewState={state} />
    </ThemeProvider>
  );
}
```

## To modify code for this plugin

In one shell, start jbrowse-web which starts on port 3000

```
cd jbrowse-components/products/jbrowse-web
yarn
yarn start
```

In another shell, start the dev server for this plugin which starts on port 9000

```
cd jbrowse-plugin-ucsc-api
yarn start
#then visit http://localhost:3000/?config=http://localhost:9000/config.json
```
