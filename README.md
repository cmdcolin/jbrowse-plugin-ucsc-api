# jbrowse-plugin-ucsc

This plugin adapts the [UCSC API](https://genome.ucsc.edu/goldenPath/help/api.html)

## Demo

https://s3.amazonaws.com/jbrowse.org/code/jb2/master/index.html?config=https%3A%2F%2Funpkg.com%2Fjbrowse-plugin-ucsc%2Fdist%2Fconfig.json&session=share-wyY8ZgC9uY&password=CtcMX

## Screenshot

![](img/1.png)

## To use in jbrowse-web

Add to the "plugins" of your JBrowse Web config:

```json
{
  "plugins": [
    {
      "name": "UCSC",
      "url": "https://unpkg.com/jbrowse-plugin-ucsc/dist/jbrowse-plugin-ucsc.umd.production.min.js"
    }
  ]
}
```

You can also download this file to your local server if you don't want to use a CDN
