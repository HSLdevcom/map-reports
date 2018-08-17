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
    reporters(onlyWithGeoJSON: Boolean): [Reporter]
    reporter(reporterId: ID): Reporter
    inspection(inspectionId: ID): Inspection
    inspections: [Inspection]
  }

  type Mutation {
    createReport(reportData: InputReport!, reportItem: InputReportItem): Report
    removeReport(reportId: String!): Boolean
    setStatus(reportId: String!, newStatus: ReportStatus): Report
    setPriority(reportId: String!, newPriority: ReportPriority): Report
    createInspection(inspection: InspectionSpecInput): Inspection
  }
`

export default rootTypeDefs
