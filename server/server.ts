require('dotenv').config()

import Express from 'express'
import path from 'path'
import database from './database'
import createServer from './graphql/schema'
import hslMapStyle from 'hsl-map-style'
import fs from 'fs-extra'
;(async () => {
  /**
   * Set up database
   */

  const db = await database()

  /**
   * Start server
   */

  // create vector map style
  const style = hslMapStyle.generateStyle({
    glyphsUrl: 'https://kartat.hsldev.com/',
    components: {
      text_fisv: { enabled: true },
      routes: { enabled: true },
      stops: { enabled: true },
      citybikes: { enabled: true },
      icons: { enabled: true },
      print: { enabled: false },
      municipal_borders: { enabled: false },
    },
  })

  const simpleStyle = hslMapStyle.generateStyle({
    glyphsUrl: 'https://kartat.hsldev.com/',
    components: {
      text_fisv: { enabled: true },
      routes: { enabled: false },
      stops: { enabled: false },
      citybikes: { enabled: false },
      icons: { enabled: false },
      print: { enabled: false },
      municipal_borders: { enabled: false },
    },
  })

  const app = Express()

  app.use('/dist', Express.static(path.join(__dirname, '../dist')))

  app.get('/style.json', (req, res) => {
    res.set('Content-Type', 'application/json')
    res.send(style)
  })

  app.get('/simple-style.json', (req, res) => {
    res.set('Content-Type', 'application/json')
    res.send(simpleStyle)
  })

  app.get('/datasets/:name', async (req, res) => {
    const { name } = req.params

    const dataset = await fs.readJSON(path.join(__dirname, 'datasets/', name))

    res.set('Content-Type', 'application/json')
    res.send(dataset)
  })

  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')))

  const server = createServer(db)
  server.applyMiddleware({ app })

  app.listen({ port: 1234 }, () =>
    console.log(`🚀 Server ready at http://localhost:1234`)
  )
})()
