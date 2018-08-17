export enum ReportStatus {
  NEW = 'NEW',
  ACCEPTED = 'ACCEPTED',
  WIP = 'WIP',
  DONE = 'DONE',
  REJECTED = 'REJECTED',
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

export interface Report<ItemType = ReportItem> {
  id?: string
  title: string
  message?: string
  status: ReportStatus
  priority: ReportPriority
  item: ItemType | string
  created_at?: number
  updated_at?: number
}

export interface ReportDraft {
  title: string
  message?: string
  entityIdentifier: string
  type: string
  data?: string
}
