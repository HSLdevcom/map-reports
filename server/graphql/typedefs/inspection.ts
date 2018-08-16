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
    convertData: String
  }

  type Inspection {
    id: ID!
    name: String!
    type: InspectionType!
    datasetType: DatasetType!
    datasetUri: String
    cron: String
    convertData: String
    created_at: String!
    updated_at: String!
  }
`

export default inspectionTypeDefs