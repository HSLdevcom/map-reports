import fuzzysearch from 'fuzzysearch'
import { orderBy, get, toLower, groupBy, values, merge } from 'lodash'
import {
  Report,
  ReportItem,
  ReportPriority as ReportPriorityEnum,
  ReportStatus as ReportStatusEnum,
} from '../../../shared/types/Report'
import createCursor from '../../util/createCursor'
import { ReportDataInput } from '../../../shared/types/CreateReportData'
import { createReport as reportFactory } from '../../reports/createReport'
import pFilter from 'p-filter'

const filterableKeys = [
  'reporter.id',
  'reporter.type',
  'status',
  'priority',
  'item.type',
  'item.entityIdentifier',
]

// Get the values that these props should be sorted by.
// Only props listed here use special values, all
// others use the value that is in the object.
const sortValues = {
  reporter: obj => (obj.reporter.type === 'manual' ? 1 : 0),
  status: obj => Object.values(ReportStatusEnum).indexOf(obj.status),
  priority: obj => Object.values(ReportPriorityEnum).indexOf(obj.priority),
  created_at: obj => +new Date(obj.created_at),
  updated_at: obj => +new Date(obj.updated_at),
}

const reportResolvers = db => {
  const reportsDb = db.table('report')
  const reportItemsDb = db.table('reportItem')
  const reporterDb = db.table('reporter')

  function createRelationResolver() {
    const relations = {
      reporter: {
        resolved: [],
        db: reporterDb,
      },
      item: {
        resolved: [],
        db: reportItemsDb,
      },
    }

    return async report => {
      const returnReport = { ...report }

      for (const reportProp in report) {
        if (reportProp in relations === false || typeof report[reportProp] !== 'string') {
          continue
        }

        let related = relations[reportProp].resolved.find(
          r => r.id === report[reportProp]
        )

        if (!related) {
          related = await relations[reportProp].db.get(report[reportProp])
          relations[reportProp].resolved.push(related)
        }

        returnReport[reportProp] = related
      }

      return returnReport
    }
  }

  async function applyFilters(reportsToFilter, filterRules) {
    const filterGroups = values(groupBy(filterRules.filter(f => !!f.key), 'key'))
    const resolveRelations = createRelationResolver()

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
      value => {
        const getSortValue = get(sortValues, sortRules.key, obj => obj[sortRules.key])
        return getSortValue(value)
      },
      sortRules.direction
    )
  }

  async function allReports() {
    return reportsDb.get()
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
    const resolveRelations = createRelationResolver()

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

    const report = reportFactory(reportData, get(reportItemInsert, '[0]'))

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
    allReports,
    resolveReportItem,
    reportFilterOptions,
    createReport,
    setStatus,
    setPriority,
    removeReport,
  }
}

export default reportResolvers
