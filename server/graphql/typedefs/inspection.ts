import gql from 'graphql-tag'

const inspectionTypeDefs = gql`
  enum InspectionType {
    cron
    onetime
    manual
  }

  enum DatasetType {
    geojson
    csv
    none
  }

  input InspectionSpecInput {
    name: String!
    type: InspectionType!
    datasetType: DatasetType!
    datasetUri: String
    cron: String
    entityIdentifier: String
    geoJSONProps: String
  }

  type Inspection {
    id: ID!
    name: String!
    type: InspectionType!
    datasetType: DatasetType
    datasetUri: String
    cron: String
    entityIdentifier: String!
    geoJSONProps: String
    geoJSON: String
    createdAt: String!
    updatedAt: String!
  }
`

export default inspectionTypeDefs
