import * as React from 'react'
import gql from 'graphql-tag'
import { observer } from 'mobx-react'
import { mutate } from '../helpers/Mutation'
import styled from 'styled-components'
import { Button } from '@material-ui/core'
import { CommentFragment } from '../fragments/CommentFragment'
import { get } from 'lodash'
import { reportQuery } from '../queries/reportQuery'
import { query } from '../helpers/Query'
import Comment from './Comment'
import { updateApolloCache } from '../helpers/updateApolloCache'

const createCommentMutation = gql`
  mutation createComment($comment: CommentInput!, $reportId: String!) {
    createComment(comment: $comment, reportId: $reportId) {
      ...CommentFields
    }
  }
  ${CommentFragment}
`

const updateCommentsCache = ({ reportId }) => {
  const getData = (existingData, mutationResult) => {
    if (existingData && mutationResult) {
      existingData.report.comments.unshift(mutationResult)
      return existingData
    }

    return false
  }

  return updateApolloCache(reportQuery, { reportId }, getData, 'Comment')
}

const CommentsList = styled.div`
  margin-top: 2rem;
`

const CreateCommentForm = styled.form`
  margin-top: 0.5rem;
  border: 1px solid #00aaff;
  border-radius: 5px;
  padding: 0.5rem;
`

const CommentBodyField = styled.textarea`
  padding: 0;
  min-height: 5rem;
  width: 100%;
  border: 0;
  margin: 0;
  background: transparent;
`

@query({ query: reportQuery, getVariables: ({ reportId }) => ({ reportId }) })
@mutate({
  mutation: createCommentMutation,
  update: updateCommentsCache,
})
@observer
class Comments extends React.Component<any, any> {
  state = {
    body: '',
  }

  setDraftBody = e => {
    this.setState({
      body: e.target.value,
    })
  }

  onSubmitComment = async e => {
    e.preventDefault()
    const { mutate, reportId } = this.props

    mutate({
      variables: {
        comment: {
          body: this.state.body,
        },
        reportId,
      },
    })
  }

  render() {
    const { queryData } = this.props
    const { body } = this.state

    const comments = get(queryData, 'report.comments', [])

    return (
      <CommentsList>
        {comments.map(comment => (
          <Comment comment={comment} key={`comment_${comment.id}`} />
        ))}
        <CreateCommentForm onSubmit={this.onSubmitComment}>
          <CommentBodyField value={body} onChange={this.setDraftBody} />
          <Button type="submit" variant="raised" color="primary">
            Comment
          </Button>
        </CreateCommentForm>
      </CommentsList>
    )
  }
}

export default Comments
