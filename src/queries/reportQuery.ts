import gql from 'graphql-tag'
import { ReportFragment } from '../fragments/ReportFragment'

export const reportQuery = gql`
  query reportQuery($reportId: String!) {
    report(reportId: $reportId) {
      ...ReportFields
    }
  }
  ${ReportFragment}
`
