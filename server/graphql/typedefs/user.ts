import gql from 'graphql-tag'

const userTypeDefs = gql`
  type User {
    id: ID!
    name: String!
    email: String!
    group: String!
    created_at: String!
    updated_at: String!
  }
`

export default userTypeDefs
