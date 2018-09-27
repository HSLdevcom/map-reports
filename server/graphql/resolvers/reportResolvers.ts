import fuzzysearch from 'fuzzysearch'
import { orderBy, get, toLower, groupBy, values, merge } from 'lodash'
import {
  Report,
  ReportItem,
  ReportPriority,
  ReportPriority as ReportPriorityEnum,
  ReportStatus,
  ReportStatus as ReportStatusEnum,
} from '../../../shared/types/Report'
import createCursor from '../../../shared/utils/createCursor'
import { ReportDataInput } from '../../../shared/types/CreateReportData'
import pFilter from 'p-filter'
import { createRelationResolver } from '../../util/resolveRelations'

const filterableKeys = ['status', 'priority', 'item.type', 'item.entityIdentifier']

// Get the values that these props should be sorted by.
// Only props listed here use special values, all
// others use the value that is in the object.
const sortValues = {
  status: obj => Object.values(ReportStatusEnum).indexOf(obj.status),
  priority: obj => Object.values(ReportPriorityEnum).indexOf(obj.priority),
  created_at: obj => +new Date(obj.created_at),
  updated_at: obj => +new Date(obj.updated_at),
}

const reportResolvers = db => {
  const reportsDb = db.table('report')
  const reportItemsDb = db.table('reportItem')

  const relations = {
    item: 'reportItem',
    user: 'user',
  }

  const reportRelationResolver = () => createRelationResolver(db, relations)

  async function applyFilters(reportsToFilter, filterRules) {
    const filterGroups = values(groupBy(filterRules.filter(f => !!f.key), 'key'))
    const resolveRelations = reportRelationResolver()

    // Include only reports that match all filters
    return pFilter(reportsToFilter, async reportRecord => {
      const report = await resolveRelations(reportRecord)
      // make sure that the current report matches every filter group
      return filterGroups.every(filterGroup =>
        // Filters are grouped by key. If there are many keys, treat it as an
        // "or" filter such that the report[key] value matches either filter.
        // A single filter in a group is effectively an "and" filter.
        filterGroup.some(filter => {
          // Use fuzzy search to match the filter value and the report[key] value.
          return fuzzysearch(toLower(filter.value), toLower(get(report, filter.key, '')))
        })
      )
    })
  }

  function applySorting(reportsToSort, sortRules) {
    return orderBy<Report>(
      reportsToSort,
      report => {
        const getSortValue = get(sortValues, sortRules.key, obj => obj[sortRules.key])
        return getSortValue(report)
      },
      sortRules.direction
    )
  }

  async function getReport(_, { reportId }) {
    return reportsDb.get(reportId)
  }

  async function allReports() {
    return reportsDb.get()
  }

  async function allReportItems() {
    return reportItemsDb.get()
  }

  async function reportsConnection(_, { perPage = 10, cursor = '', sort, filter }) {
    const reports = await reportsDb.get()

    // Filter first, then sort.
    const filteredReports = await applyFilters(reports, filter)
    const requestedReports = applySorting(filteredReports, sort)

    const reportEdges = requestedReports.map(report => ({
      node: report,
      cursor: createCursor(report, { filter, sort }),
    }))

    const sliceStart = reportEdges.findIndex(edge => edge.cursor === cursor) + 1
    const sliceEnd = sliceStart + perPage
    const totalItems = requestedReports.length
    const totalPages = !totalItems ? 0 : Math.ceil(perPage / totalItems)

    return {
      edges: reportEdges.slice(sliceStart, sliceEnd),
      pageInfo: {
        currentPage: Math.ceil(sliceStart / perPage),
        hasNextPage: sliceEnd < totalItems,
        hasPreviousPage: sliceEnd > perPage,
        totalPages,
      },
    }
  }

  async function reportFilterOptions() {
    const reports = await reportsDb.get()
    const options = []
    const resolveRelations = reportRelationResolver()

    for (const recordIndex in reports) {
      const report = await resolveRelations(reports[recordIndex])

      for (const keyIndex in filterableKeys) {
        const key = filterableKeys[keyIndex]
        let opt = options.find(o => o.key === key)

        if (!opt) {
          // Create new options/key pair of none existed
          opt = { key, options: [] }
          options.push(opt) // Add it for future iterations
        }

        // Get the value behind the key from the report item.
        const value = get(report, key, '')

        // If the value exists on this item AND has not yet been added to the options, add it.
        if (value && opt.options.indexOf(value) === -1) {
          opt.options.push(value)
        }
      }
    }

    return options
  }

  async function resolveReportItem(report): Promise<ReportItem> {
    if (typeof report.item === 'string') {
      return reportItemsDb.get(report.item)
    }

    return report.item
  }

  async function createReport(
    _,
    {
      reportData,
      reportItem,
    }: {
      reportData: ReportDataInput
      reportItem: ReportItem
    }
  ): Promise<Report> {
    const reportItemInsert = await reportItemsDb.add(reportItem)

    const reportItemId = get(reportItemInsert, '[0]')

    const defaultReportData = {
      priority: ReportPriority.LOW,
      status: ReportStatus.NEW,
      message: '',
      item: reportItemId,
    }

    const report = merge({}, defaultReportData, reportData)

    const reportRecord = await reportsDb.add(report, ['id', 'created_at', 'updated_at'])
    merge(report, get(reportRecord, '[0]', {}))

    return report
  }

  async function removeReport(_, { reportId }): Promise<boolean> {
    const removed = await reportsDb.remove(reportId)
    return removed.length > 0
  }

  async function setStatus(_, { reportId, newStatus }): Promise<Report> {
    const updated = await reportsDb.update(reportId, { status: newStatus }, [
      'id',
      'status',
      'updated_at',
    ])
    return updated[0]
  }

  async function setPriority(_, { reportId, newPriority }): Promise<Report> {
    const updated = await reportsDb.update(reportId, { priority: newPriority }, [
      'id',
      'priority',
      'updated_at',
    ])
    return updated[0]
  }

  return {
    reportsConnection,
    getReport,
    allReports,
    allReportItems,
    resolveReportItem,
    reportFilterOptions,
    createReport,
    setStatus,
    setPriority,
    removeReport,
  }
}

export default reportResolvers
