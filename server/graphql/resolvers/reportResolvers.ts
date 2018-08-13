import fuzzysearch from 'fuzzysearch'
import { orderBy, get, toLower, groupBy, values, merge } from 'lodash'
import {
  Report,
  ReportItem,
  ReportPriority as ReportPriorityEnum,
  ReportStatus as ReportStatusEnum,
} from '../../../types/Report'
import createCursor from '../../util/createCursor'
import { ManualReportDataInput } from '../../../types/CreateReportData'
import { createReport as reportFactory } from '../../reports/createReport'

const filterableKeys = ['reporter.id', 'reporter.type', 'status', 'priority']

// Get the values that these props should be sorted by.
// Only props listed here use special values, all
// others use the value that is in the object.
const sortValues = {
  reporter: obj => (obj.reporter.type === 'manual' ? 1 : 0),
  status: obj => Object.values(ReportStatusEnum).indexOf(obj.status),
  priority: obj => Object.values(ReportPriorityEnum).indexOf(obj.priority),
}

const reportResolvers = db => {
  const reportsDb = db.table('report')
  const reportItemsDb = db.table('reportItem')
  const reporterDb = db.table('reporter')

  function applyFilters(reportsToFilter, filterRules) {
    const resolvedReporters = []
    const filterGroups = values(groupBy(filterRules.filter(f => !!f.key), 'key'))

    // Include only reports that match all filters
    return reportsToFilter.filter(report =>
      // make sure that the current report matches every filter group
      filterGroups.every(filterGroup =>
        // Filters are grouped by key. If there are many keys, treat it as an
        // "or" filter such that the report[key] value matches either filter.
        // A single filter in a group is effectively an "and" filter.
        filterGroup.some(filter => {
          let reporter = resolvedReporters.find(rep => rep.id === report.reporter)
          let reportItem = report

          // If the key starts with 'reporter' and we haven't resolved the reporter yet, do it.
          if (get(filter, 'key', '').startsWith('reporter') && !reporter) {
            reporter = reporterDb.get(report.reporter)
            resolvedReporters.push(reporter) // Add to cache for future iterations
          }

          // If the key starts with 'reporter', merge the resolved reporter into the report item.
          if (get(filter, 'key', '').startsWith('reporter')) {
            reportItem = merge({}, reportItem, { reporter })
          }

          // Use fuzzy search to match the filter value and the report[key] value.
          return fuzzysearch(
            toLower(filter.value),
            toLower(get(reportItem, filter.key, ''))
          )
        })
      )
    )
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
    const requestedReports = applySorting(applyFilters(reports, filter), sort)

    const reportEdges = requestedReports.map(report => ({
      node: report,
      cursor: createCursor(report, { sort, filter }),
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
    const reports = await allReports()
    const options = []
    const resolvedReporters = []

    reports.forEach(report => {
      filterableKeys.forEach((key: string) => {
        let opt = options.find(o => o.key === key)

        if (!opt) {
          // Create new options/key pair of none existed
          opt = { key, options: [] }
          options.push(opt) // Add it for future iterations
        }

        let reportItem = report
        // Is there an already-resolved reporter in the cache?
        let reporter = resolvedReporters.find(rep => rep.id === report.reporter)

        // If the key starts with 'reporter' and we haven't resolved the reporter yet, do it.
        if (key.startsWith('reporter') && !reporter) {
          reporter = reporterDb.get(report.reporter)
          resolvedReporters.push(reporter) // Add to cache for future iterations
        }

        // If the key starts with 'reporter', merge the resolved reporter into the report item.
        if (key.startsWith('reporter')) {
          reportItem = merge({}, reportItem, { reporter })
        }

        // Get the value behind the key from the report item.
        const value = get(reportItem, key, '')

        // If the value exists on this item AND has not yet been added to the options, add it.
        if (value && opt.options.indexOf(value) === -1) {
          opt.options.push(value)
        }
      })
    })

    return options
  }

  async function createReport(
    _,
    {
      reportData,
      reportItem,
    }: {
      reportData: ManualReportDataInput
      reportItem: ReportItem
    }
  ): Promise<Report> {
    const reportItemInsert = await reportItemsDb.add(reportItem)
    const reporterId = await reporterDb.table
      .where('name', 'manual-reporter')
      .select('id')

    console.log(reportItemInsert, reporterId)

    const report = reportFactory(
      {
        ...reportData,
        reporter: reporterId[0],
      },
      reportItemInsert[0]
    )

    await reportsDb.add(report)
    return report
  }

  async function removeReport(_, { reportId }): Promise<boolean> {
    return reportsDb.remove(reportId) > 0
  }

  async function setStatus(_, { reportId, newStatus }): Promise<Report> {
    return reportsDb.update(reportId, { status: newStatus })
  }

  async function setPriority(_, { reportId, newPriority }): Promise<Report> {
    return reportsDb.update(reportId, { priority: newPriority })
  }

  return {
    reportsConnection,
    allReports,
    reportFilterOptions,
    createReport,
    setStatus,
    setPriority,
    removeReport,
  }
}

export default reportResolvers
