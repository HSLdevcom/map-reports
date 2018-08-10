require('dotenv').config()

import Express from 'express'
import database from './database'
import UnconnectedStopsReporter from './reporters/UnconnectedStopsReporter'
import createServer from './graphql/schema'
import MissingRoadsReporter from './reporters/MissingRoadsReporter'
import path from 'path'

/**
 * Set up database
 */

const db = database()

/**
 * Set up reporters
 */

// Create reporter for unconnected stops
const stopsReporter = UnconnectedStopsReporter(
  {
    id: 'reporter_1',
    type: 'automatic',
  },
  db
)

const missingRoadsReporter = MissingRoadsReporter(
  {
    id: 'reporter_2',
    type: 'automatic',
  },
  db
)

/**
 * Run reporters
 */

stopsReporter.run()
missingRoadsReporter.run()

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
