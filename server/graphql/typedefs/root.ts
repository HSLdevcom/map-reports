import { gql } from 'apollo-server'

const rootTypeDefs = gql`
  type Dataset {
    id: String!
    geoJSON: String!
  }

  type Query {
    reports: [Report]
    reportFilterOptions: [ReportFilterOptions]
    reportsConnection(
      perPage: Int = 10
      cursor: String
      sort: SortParams
      filter: [FilterParams]
    ): ReportsConnection
    reporters: [Reporter]
    datasets: [Dataset]
  }

  type Mutation {
    createReport(reportData: InputReport!, location: InputLocation!): Report
    setStatus(reportId: String!, newStatus: ReportStatus): Report
    setPriority(reportId: String!, newPriority: ReportPriority): Report
  }
`

export default rootTypeDefs
