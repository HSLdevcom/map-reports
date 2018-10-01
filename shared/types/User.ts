import { Report } from './Report'
import { Comment } from './Comment'

export interface User {
  id: string
  name: string
  email: string
  password: string
  roles: string[]
  reports?: Report[]
  comments?: Comment[]
  createdAt: string
  updatedAt: string
}
