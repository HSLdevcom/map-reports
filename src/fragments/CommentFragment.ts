import gql from 'graphql-tag'
import { UserFragment } from './UserFragment'

export const CommentFragment = gql`
  fragment CommentFields on Comment {
    id
    body
    author {
      ...UserFields
    }
    report {
      id
    }
    createdAt
    updatedAt
    __typename
  }
  ${UserFragment}
`
