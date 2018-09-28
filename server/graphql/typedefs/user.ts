import gql from 'graphql-tag'

const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    roles: [String]!
    reports: [Report]
    comments: [Comment]
    createdAt: String!
    updatedAt: String!
  }
`

export default userTypeDefs
