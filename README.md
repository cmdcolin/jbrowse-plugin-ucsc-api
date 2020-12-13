# UCSC API adapter for JBrowse 2

This plugin adapts the UCSC API

## Install

    yarn

## Usage

    yarn develop

## Screenshot

![](img/1.png)

## Demo

While `yarn develop` is running, open jbrowse-components dev server
in another tab e.g. cd packages/jbrowse-web, yarn start, and then visit

http://localhost:3000/?config=http://localhost:9000/config.json

## Use in production

Run `yarn build`, and then add the resulting plugin.js to the runtime plugins
section of the config. This is the same plugin.js type reference in the
assets/config_ucsc_api.json folder
