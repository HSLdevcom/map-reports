import { ApolloServer } from 'apollo-server-express'

// Typedefs
import root from './typedefs/root'
import util from './typedefs/util'
import report from './typedefs/report'
import inspection from './typedefs/inspection'
import comment from './typedefs/comment'
import user from './typedefs/user'

// Resolvers
import createResolvers from './resolvers/createResolvers'

const typeDefs = [root, util, report, inspection, comment, user]

function createServer(db) {
  return new ApolloServer({
    typeDefs,
    resolvers: createResolvers(db),
  })
}

export default createServer
