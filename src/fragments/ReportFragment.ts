import gql from 'graphql-tag'

export const ReportFragment = gql`
  fragment ReportFields on Report {
    id
    title
    message
    status
    priority
    item {
      id
      type
      recommendedMapZoom
      data
      lat
      lon
      entityIdentifier
      __typename
    }
    created_at
    updated_at
    __typename
  }
`
