import { Comment } from './Comment'
import { User } from './User'
import { Inspection as InspectionType } from './Inspection'

export enum ReportStatus {
  NEW = 'NEW',
  ACCEPTED = 'ACCEPTED',
  WIP = 'WIP',
  DONE = 'DONE',
  REJECTED = 'REJECTED',
  UNCLEAR = 'UNCLEAR',
}

export enum ReportPriority {
  LOW = 'LOW',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL',
}

export interface ReportItem {
  lat: number
  lon: number
  data?: string
  type: string
  recommendedMapZoom?: number
  entityIdentifier: string
}

export interface Report {
  id: string
  title: string
  message?: string
  status: ReportStatus
  priority: ReportPriority
  comments: Comment[]
  item: ReportItem
  inspection?: string
  reportedBy: User
  createdAt: string
  updatedAt: string
}

export interface ReportDraft {
  title: string
  message?: string
  entityIdentifier: string
  type: string
  data?: string
}

export interface ReportEdge {
  cursor: string
  node: Report
}

export interface ReportsConnection {
  edges: ReportEdge[]
  pageInfo: {
    currentPage: number
    hasNextPage: boolean
    hasPreviousPage: boolean
    totalPages: number
  }
}
