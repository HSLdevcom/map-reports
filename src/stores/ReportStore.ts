import { action, extendObservable } from 'mobx'
import { ReportActions } from '../../shared/types/ReportActions'
import { get } from 'lodash'

const emptyReport = {
  title: '',
  message: '',
  entityIdentifier: 'unknown',
  type: 'general',
  data: '{}',
}

const ReportStore = (state, initialState): ReportActions => {
  const reportState = extendObservable(state, {
    focusedReport: get(initialState, 'focusedReport', null),
    reportDraft: get(initialState, 'reportDraft', emptyReport),
    sortReports: get(initialState, 'sortReports', {
      key: 'created_at',
      direction: 'desc',
    }),
    filterReports: get(initialState, 'filterReports', [{ key: '', value: '' }]),
  })

  const createReport = action(() => {
    reportState.reportDraft = emptyReport
  })

  const setDraftEntity = action((entityIdentifier, type) => {
    reportState.reportDraft.entityIdentifier = entityIdentifier
    reportState.reportDraft.type = type
  })

  const setDraftData = action(data => {
    reportState.reportDraft.data = JSON.stringify(data)
  })

  const sortReports = action(
    (
      key = reportState.sortReports.key,
      direction = reportState.sortReports.direction
    ) => {
      reportState.sortReports.key = key
      reportState.sortReports.direction = direction
    }
  )

  const addReportsFilter = action((key = '', value = '') => {
    const filterTerm = { key, value }
    reportState.filterReports.push(filterTerm)
  })

  const setFilterValues = action(
    (filterIndex: number, key?: string, value: string = '') => {
      const filter = reportState.filterReports[filterIndex]

      if (filter) {
        filter.key = key ? key : filter.key
        filter.value = value
      }
    }
  )

  const removeFilter = action((index: number) => {
    reportState.filterReports.splice(index, 1)
  })

  const focusReport = action((reportId: string = null) => {
    let setVal = reportId

    if (reportState.focusedReport === reportId) {
      setVal = null
    }

    reportState.focusedReport = setVal
  })

  return {
    createReport,
    setDraftEntity,
    setDraftData,
    sortReports,
    addReportsFilter,
    setFilterValues,
    removeFilter,
    focusReport,
  }
}

export default ReportStore
