import { ApolloServer } from 'apollo-server-express'

// Typedefs
import root from './typedefs/root'
import util from './typedefs/util'
import reporter from './typedefs/reporter'
import report from './typedefs/report'

// Resolvers
import createResolvers from './resolvers/createResolvers'

const typeDefs = [root, util, reporter, report]

function createServer(db) {
  return new ApolloServer({
    typeDefs,
    resolvers: createResolvers(db)
  })
}

export default createServer
