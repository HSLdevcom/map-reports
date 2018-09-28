import { Comment } from '../../entity/Comment'
import { Comment as CommentType } from '../../../shared/types/Comment'
import { Report } from '../../entity/Report'

const commentResolvers = db => {
  const commentsRepo = db.getRepo(Comment)
  const reportsRepo = db.getRepo(Report)

  async function createComment(_, { comment, reportId }): Promise<CommentType> {
    // TODO: Add the user authenticated for the request
    const user = db.getAdmin()

    const report = await reportsRepo().findOne(reportId)

    const commentEntity = new Comment()
    Object.assign(commentEntity, comment)

    commentEntity.report = report
    commentEntity.author = user

    commentsRepo.save(commentEntity)

    return commentEntity
  }

  async function removeComment(_, { commentId }): Promise<boolean> {
    const comment = await commentsRepo.findOne(commentId)
    await commentsRepo.remove(comment)
    return true
  }

  return {
    createComment,
    removeComment,
  }
}

export default commentResolvers
