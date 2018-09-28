import { Report } from './Report'
import { User } from './User'

export interface Comment {
  id: string
  body: string
  author: User
  report: Report
  createdAt?: string
  updatedAt?: string
}
