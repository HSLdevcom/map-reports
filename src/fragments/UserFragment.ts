import gql from 'graphql-tag'

export const UserFragment = gql`
  fragment UserFields on User {
    id
    name
    email
    created_at
    updated_at
  }
`
