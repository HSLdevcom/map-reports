import { gql } from 'apollo-server-express'

const reporterTypeDefs = gql`
  type Reporter {
    id: ID!
    name: String!
    type: String!
    dataset: String
  }
`

export default reporterTypeDefs
