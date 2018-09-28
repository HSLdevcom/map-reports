import { gql } from 'apollo-server-express'

const rootTypeDefs = gql`
  type Query {
    report(reportId: String!): Report
    reports: [Report]
    reportFilterOptions: [ReportFilterOptions]
    reportsConnection(
      perPage: Int = 10
      cursor: String
      sort: SortParams
      filter: [FilterParams]
    ): ReportsConnection
    reportItems: [ReportItem]
    inspection(inspectionId: ID): Inspection
    inspections: [Inspection]
  }

  type Mutation {
    createReport(reportData: InputReport!, reportItem: InputReportItem): Report
    removeReport(reportId: String!): Boolean
    setStatus(reportId: String!, newStatus: ReportStatus): Report
    setPriority(reportId: String!, newPriority: ReportPriority): Report
    createInspection(inspection: InspectionSpecInput): Inspection
    createComment(comment: CommentInput!, reportId: String!): Comment
    removeComment(commentId: String!): Boolean
  }
`

export default rootTypeDefs
