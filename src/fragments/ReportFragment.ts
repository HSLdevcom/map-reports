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
    reporter {
      id
      name
      type
      __typename
    }
    __typename
  }
`
