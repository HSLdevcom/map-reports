import gql from 'graphql-tag'
import { CommentFragment } from './CommentFragment'

export const ReportFragment = gql`
  fragment ReportFields on Report {
    id
    title
    message
    status
    priority
    item {
      id
      type
      recommendedMapZoom
      data
      lat
      lon
      entityIdentifier
    }
    created_at
    updated_at
    comments {
      ...CommentFields
    }
  }
  ${CommentFragment}
`
