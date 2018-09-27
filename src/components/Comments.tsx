import * as React from 'react'
import gql from 'graphql-tag'
import { observer } from 'mobx-react'
import { mutate } from '../helpers/Mutation'
import styled from 'styled-components'
import { Button } from '@material-ui/core'
import { CommentFragment } from '../fragments/CommentFragment'
import { get } from 'lodash'
import { reportQuery } from '../queries/reportQuery'
import { reportsCacheQuery } from '../queries/reportsQuery'

const createCommentMutation = gql`
  mutation createComment($comment: CommentInput!, $reportId: String!) {
    createComment(comment: $comment, reportId: $reportId) {
      ...CommentFields
    }
  }
  ${CommentFragment}
`

const CommentsList = styled.div`
  margin-top: 2rem;
`

const Comment = styled.div`
  margin-bottom: 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  padding: 0.75rem;
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

const updateCommentsCache = ({ reportId }) => (store, { data }) => {
  const operationName = Object.keys(data)[0]
  const newCommentResult = { ...get(data, operationName, {}), __typename: 'Comment' }

  if (newCommentResult) {
    let reports

    try {
      reports = store.readQuery({
        query: reportsCacheQuery,
      })
    } catch (err) {
      reports = { reportsConnection: { edges: [] } }
    }

    const commentParent = get(reports, 'reportsConnection.edges', []).find(
      edge => edge.node.id === reportId
    )

    // TODO: Make this work

    console.log(commentParent, reports)

    if (commentParent) {
      commentParent.comments.unshift(newCommentResult)

      store.writeQuery({
        query: reportsCacheQuery,
        data: reports,
      })
    }
  }
}

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
    const { comments } = this.props
    const { body } = this.state

    return (
      <CommentsList>
        {comments.map(comment => (
          <Comment key={`comment_${comment.id}`}>{comment.body}</Comment>
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
