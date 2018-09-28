import gql from 'graphql-tag'
import { UserFragment } from './UserFragment'

export const CommentFragment = gql`
  fragment CommentFields on Comment {
    id
    body
    user {
      ...UserFields
    }
    report {
      id
    }
    created_at
    updated_at
    __typename
  }
  ${UserFragment}
`
