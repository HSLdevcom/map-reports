import pMap from 'p-map'
import { createRelationResolver } from '../../util/resolveRelations'

const commentResolvers = db => {
  const commentsDb = db.table('comment')
  const usersDb = db.table('user')

  const commentRelationsResolver = () =>
    createRelationResolver(db, {
      user: 'user',
      report: 'report',
    })

  async function resolveCommentsForReport(report) {
    const reportComments = await commentsDb
      .table()
      .where({ report: report.id })
      .orderBy('created_at', 'desc')

    if (reportComments.length === 0) {
      return reportComments
    }

    const resolveRelations = commentRelationsResolver()
    return pMap(reportComments, resolveRelations)
  }

  async function createComment(_, { comment, reportId }) {
    const user = await usersDb
      .table()
      .where('name', 'Admin')
      .first()

    const addedComment = await commentsDb.add(
      { ...comment, report: reportId, user: user.id },
      ['id', 'created_at', 'updated_at', 'body', 'user', 'report']
    )

    if (addedComment.length !== 0) {
      const resolveRelations = commentRelationsResolver()
      return resolveRelations(addedComment[0])
    }

    return []
  }

  async function removeComment(_, { commentId }) {
    const removed = await commentsDb.remove(commentId)
    return removed > 0
  }

  return {
    resolveCommentsForReport,
    createComment,
    removeComment,
  }
}

export default commentResolvers
