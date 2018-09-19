export interface ReportActions {
  sortReports: (key: string, direction: string) => void
  addReportsFilter: (key?: string, value?: string) => void
  setFilterValues: (filterIndex: number, key?: string, value?: string) => void
  removeFilter: (filterIndex: number) => void
  focusReport: (reportId?: string) => void
}
