import * as React from 'react'
import styled from 'styled-components'
import { mutate } from '../helpers/Mutation'
import gql from 'graphql-tag'
import { Comment as CommentType } from '../../shared/types/Comment'
import { Delete } from '@material-ui/icons'
import { Button } from '@material-ui/core'
import { AnyFunction } from '../../shared/types/AnyFunction'
import { get } from 'lodash'
import { reportQuery } from '../queries/reportQuery'
import { updateApolloCache } from '../helpers/updateApolloCache'

const removeCommentMutation = gql`
  mutation removeComment($commentId: String!) {
    removeComment(commentId: $commentId)
  }
`

const CommentElement = styled.div`
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 0.75rem;
`

const updateCommentsCache = ({ comment }) => {
  const getData = (existingData, mutationResult) => {
    if (existingData && mutationResult) {
      const commentIndex = existingData.report.comments.findIndex(
        c => c.id === comment.id
      )

      if (commentIndex > -1) {
        existingData.report.comments.splice(commentIndex, 1)
        return existingData
      }
    }

    return false
  }

  return updateApolloCache(reportQuery, { reportId: comment.report.id }, getData)
}

interface Props {
  comment: CommentType
  mutate?: AnyFunction
}

@mutate({
  mutation: removeCommentMutation,
  update: updateCommentsCache,
})
class Comment extends React.Component<Props, any> {
  onRemoveClick = e => {
    e.preventDefault()
    const { mutate, comment } = this.props

    mutate({
      variables: {
        commentId: comment.id,
      },
    })
  }

  render() {
    const { comment } = this.props

    return (
      <CommentElement>
        {comment.body}
        <Button
          size="small"
          color="secondary"
          onClick={this.onRemoveClick}
          aria-label="Delete">
          <Delete />
        </Button>
      </CommentElement>
    )
  }
}

export default Comment
