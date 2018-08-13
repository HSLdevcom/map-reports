import gql from 'graphql-tag'

export const ReportFragment = gql`
  fragment ReportFields on Report {
    id
    title
    message
    status
    priority
    item {
      type
      recommendedMapZoom
      data
      lat
      lon
      entityIdentifier
    }
    createdAt
    updatedAt
    reporter {
      id
      name
      type
      __typename
    }
    __typename
  }
`
