import { gql } from 'apollo-server-express'

const rootTypeDefs = gql`  

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
  }

  type Mutation {
    createReport(
      reportData: InputReport!
      reportItem: InputReportItem
    ): Report
    removeReport(reportId: String!): Boolean
    setStatus(reportId: String!, newStatus: ReportStatus): Report
    setPriority(reportId: String!, newPriority: ReportPriority): Report
  }
`

export default rootTypeDefs
