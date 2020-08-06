# UCSC API adapter for JBrowse 2

This plugin adapts the UCSC API

Expects to be run on port 9001 to be used in combination with the arc renderer plugin

## Install

    yarn

## Usage

    yarn develop --port 9001

## Screenshot

![](img/1.png)

## Demo

While `yarn develop --port 9001` is running, open jbrowse-components dev server
in another tab e.g. cd packages/jbrowse-web, yarn start, and then visit

http://localhost:3000/?config=http://localhost:9001/config_ucsc_api.json

This will point jbrowse 2 at the config hosted by this repository in the
assets/config_ucsc_api.json file of this repo. Note that port 9001 is hardcoded
in there.

## Use in production

Run `yarn build`, and then add the resulting plugin.js to the runtime plugins
section of the config. This is the same plugin.js type reference in the
assets/config_ucsc_api.json folder
