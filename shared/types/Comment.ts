import { Report } from './Report'

export interface Comment {
  id: string
  body: string
  user: any
  report: Report | string
  created_at?: number
  updated_at?: number
}
