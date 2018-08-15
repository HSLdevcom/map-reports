export interface ReportActions {
  createReport: () => void
  setDraftEntity: (entityIdentifier: string, type: string) => void
  setDraftData: (data: any) => void
  sortReports: (key: string, direction: string) => void
  addReportsFilter: (key?: string, value?: string) => void
  setFilterValues: (filterIndex: number, key?: string, value?: string) => void
  removeFilter: (filterIndex: number) => void
  focusReport: (reportId?: string) => void
}
