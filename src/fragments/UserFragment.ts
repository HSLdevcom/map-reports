import gql from 'graphql-tag'

export const UserFragment = gql`
  fragment UserFields on User {
    id
    name
    email
    createdAt
    updatedAt
  }
`
