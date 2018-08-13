require('dotenv').config()

import Express from 'express'
import path from 'path'
import database from './database'
import createServer from './graphql/schema'
import UnconnectedStopsReporter from './reporters/UnconnectedStopsReporter'
import MissingRoadsReporter from './reporters/MissingRoadsReporter'
import runReporters from './reporters/runReporters'
import registerReporters from './reporters/registerReporters'

(async () => {
  /**
   * Set up database
   */

  const db = await database()

  /**
   * Set up reporters
   */

  const reporters = [
    {
      name: 'unconnected-stops-reporter',
      type: 'automatic',
      run: UnconnectedStopsReporter,
    }, {
      name: 'missing-roads-reporter',
      type: 'automatic',
      run: MissingRoadsReporter
    }, {
      name: 'manual-reporter',
      type: 'manual'
    }
  ]

  await registerReporters(reporters, db)
  await runReporters(reporters, db)

  /**
   * Start server
   */

  const app = Express()

  app.use('/dist', Express.static(path.join(__dirname, '../dist')))
  app.get('*', (req, res) => res.sendFile(path.join(__dirname, '../dist/index.html')))

  const server = createServer(db)
  server.applyMiddleware({ app })

  app.listen({ port: 1234 }, () =>
    console.log(`🚀 Server ready at http://localhost:1234${server.graphqlPath}`)
  )
})()
