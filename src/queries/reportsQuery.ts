import { ReportFragment } from '../fragments/ReportFragment'
import gql from 'graphql-tag'

// For local cache operations
export const emptyArguments = {
  cursor: '',
  filter: [{ key: '', value: '' }],
  perPage: 10,
  sort: { direction: 'desc', key: 'createdAt' },
}

export const reportsQuery = gql`
  query reportsQuery(
    $perPage: Int = 10
    $cursor: String = ""
    $sort: SortParams
    $filter: [FilterParams]
  ) {
    reportsConnection(perPage: $perPage, cursor: $cursor, sort: $sort, filter: $filter)
      @connection(key: "reports", filter: ["sort", "filter"]) {
      pageInfo {
        currentPage
        hasNextPage
        hasPreviousPage
        totalPages
      }
      edges {
        cursor
        node {
          ...ReportFields
        }
      }
    }
  }
  ${ReportFragment}
`

export const reportsCacheQuery = gql`
  query reportsCacheQuery($sort: SortParams, $filter: [FilterParams]) {
    reportsConnection(sort: $sort, filter: $filter)
      @connection(key: "reports", filter: ["sort", "filter"]) {
      edges {
        cursor
        node {
          ...ReportFields
        }
      }
    }
  }
  ${ReportFragment}
`
