import gql from 'graphql-tag'

const commentTypeDefs = gql`
  type Comment {
    id: ID!
    body: String!
    author: User!
    report: Report!
    createdAt: String
    updatedAt: String
  }

  input CommentInput {
    body: String!
  }
`

export default commentTypeDefs
