import { ApolloServer } from 'apollo-server-express'

// Typedefs
import root from './typedefs/root'
import util from './typedefs/util'
import report from './typedefs/report'
import inspection from './typedefs/inspection'

// Resolvers
import createResolvers from './resolvers/createResolvers'

const typeDefs = [root, util, report, inspection]

function createServer(db) {
  return new ApolloServer({
    typeDefs,
    resolvers: createResolvers(db),
  })
}

export default createServer
