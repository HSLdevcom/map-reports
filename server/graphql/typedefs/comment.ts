import gql from 'graphql-tag'

const commentTypeDefs = gql`
  type Comment {
    id: ID!
    body: String!
    user: User!
    report: Report!
    created_at: String!
    updated_at: String!
  }

  input CommentInput {
    body: String!
  }
`

export default commentTypeDefs
