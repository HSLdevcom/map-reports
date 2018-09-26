require('dotenv').config()

import Express from 'express'
import path from 'path'
import database from './database'
import createServer from './graphql/schema'
import hslMapStyle from 'hsl-map-style'
import fs from 'fs-extra'
import boolParser from 'express-query-boolean'
import { get, merge, pick, reduce } from 'lodash'

const styleComponents = {
  text: true,
  text_sv: false,
  text_fisv: true,
  routes: true,
  stops: true,
  citybikes: true,
  icons: true,
  print: false,
  municipal_borders: false,
}

function getStyleComponents(selection) {
  const styleKeys = Object.keys(styleComponents)
  const mergedSelection = merge(
    {},
    styleComponents,
    pick(
      selection,
      Object.keys(selection).filter(selectedComponent =>
        styleKeys.includes(selectedComponent)
      )
    )
  )

  return reduce(
    mergedSelection,
    (components, isEnabled, key) => {
      components[key] = { enabled: isEnabled }
      return components
    },
    {}
  )
}

;(async () => {
  /**
   * Set up database
   */

  const db = await database()

  /**
   * Start server
   */

  // create vector map style
  const style = {
    glyphsUrl: 'https://kartat.hsldev.com/',
    components: {},
  }

  const app = Express()

  const server = createServer(db)
  server.applyMiddleware({ app })

  app.use(boolParser())
  app.use('/dist', Express.static(path.join(__dirname, '../dist')))

  app.get('/style.json', (req, res) => {
    const selectedComponents = getStyleComponents(req.query)
    const selectedStyle = { ...style, components: selectedComponents }

    res.set('Content-Type', 'application/json')
    res.send(hslMapStyle.generateStyle(selectedStyle))
  })

  app.get('/datasets/:name', async (req, res) => {
    const { name } = req.params

    const dataset = await fs.readJSON(path.join(__dirname, 'datasets/', name))

    res.set('Content-Type', 'application/json')
    res.send(dataset)
  })

  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')))

  app.listen({ port: 1234 }, () =>
    console.log(`🚀 Server ready at http://localhost:1234`)
  )
})()
