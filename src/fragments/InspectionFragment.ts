import gql from 'graphql-tag'

export const InspectionFragment = gql`
  fragment InspectionFields on Inspection {
    id
    name
    type
    datasetType
    datasetUri
    cron
    geoJSONProps
    entityIdentifier
    created_at
    updated_at
  }
`
