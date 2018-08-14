import { gql } from 'apollo-server-express'

const reportTypeDefs = gql`
  enum ReportStatus {
    NEW
    ACCEPTED
    WIP
    DONE
    REJECTED
  }

  enum ReportPriority {
    LOW
    HIGH
    CRITICAL
  }

  type ReportItem {
    id: ID!
    type: String!
    lat: Float!
    lon: Float!
    entityIdentifier: String!
    data: String
    recommendedMapZoom: Int
  }

  input InputReportItem {
    type: String!
    lat: Float!
    lon: Float!
    recommendedMapZoom: Int
    entityIdentifier: String!
    data: String
  }

  type Report {
    id: ID!
    title: String!
    message: String
    reporter: Reporter!
    status: ReportStatus!
    priority: ReportPriority!
    item: ReportItem!
    created_at: String!
    updated_at: String!
  }

  input InputReport {
    title: String!
    message: String
    reporter: ID
  }

  type ReportsEdge {
    cursor: String
    node: Report
  }

  type ReportsConnection {
    pageInfo: PageInfo
    edges: [ReportsEdge]
  }

  type ReportFilterOptions {
    key: String!
    options: [String]!
  }
`

export default reportTypeDefs
