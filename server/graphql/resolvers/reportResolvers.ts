import fuzzysearch from 'fuzzysearch'
import { orderBy, get, toLower, groupBy, values } from 'lodash'
import {
  Report as ReportType,
  ReportEdge,
  ReportItem as ReportItemType,
  ReportPriority,
  ReportPriority as ReportPriorityEnum,
  ReportsConnection,
  ReportStatus,
  ReportStatus as ReportStatusEnum,
} from '../../../shared/types/Report'
import createCursor from '../../../shared/utils/createCursor'
import { ReportDataInput } from '../../../shared/types/CreateReportData'
import pFilter from 'p-filter'
import { Report } from '../../entity/Report'
import { ReportItem } from '../../entity/ReportItem'

const filterableKeys = ['status', 'priority', 'item.type', 'item.entityIdentifier']

// Get the values that these props should be sorted by.
// Only props listed here use special values, all
// others use the value that is in the object.
const sortValues = {
  status: obj => Object.values(ReportStatusEnum).indexOf(obj.status),
  priority: obj => Object.values(ReportPriorityEnum).indexOf(obj.priority),
  createdAt: obj => +new Date(obj.createdAt),
  updatedAt: obj => +new Date(obj.updatedAt),
}

const reportResolvers = db => {
  const reportsRepo = db.getRepo(Report)
  const reportItemsRepo = db.getRepo(ReportItem)

  async function applyFilters(reportsToFilter, filterRules) {
    const filterGroups = values(groupBy(filterRules.filter(f => !!f.key), 'key'))

    // Include only reports that match all filters
    return pFilter(reportsToFilter, async report => {
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
    return orderBy<ReportType>(
      reportsToSort,
      report => {
        const getSortValue = get(sortValues, sortRules.key, obj => obj[sortRules.key])
        return getSortValue(report)
      },
      sortRules.direction
    )
  }

  async function getReportResolver(_, { reportId }): Promise<ReportType> {
    return getReport(reportId)
  }

  async function getReport(reportId): Promise<ReportType> {
    return reportsRepo.findOne(reportId, {
      relations: ['item', 'reportedBy', 'comments'],
    })
  }

  async function allReports(): Promise<ReportType[]> {
    return reportsRepo.find({ relations: ['item', 'reportedBy', 'comments'] })
  }

  async function allReportItems(): Promise<ReportItemType[]> {
    return reportItemsRepo.find({ relations: ['report'] })
  }

  async function reportsConnection(
    _,
    { perPage = 10, cursor = '', sort, filter }
  ): Promise<ReportsConnection> {
    const reports = await allReports()

    // Filter first, then sort.
    const filteredReports = await applyFilters(reports, filter)
    const requestedReports = applySorting(filteredReports, sort)

    const reportEdges: ReportEdge[] = requestedReports.map(report => ({
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
    const reports = await allReports()
    const options = []

    for (const recordIndex in reports) {
      const report = reports[recordIndex]

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

  async function resolveReportItem(report): Promise<ReportItemType> {
    if (typeof report.item === 'string') {
      return reportItemsRepo.findOne({ id: report.item, relations: ['report'] })
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
      reportItem: ReportItemType
    }
  ): Promise<ReportType> {
    const user = await db.getAdmin()
    let reportItemEntity = new ReportItem()
    let reportEntity = new Report()

    const defaultReportData = {
      priority: ReportPriority.LOW,
      status: ReportStatus.NEW,
      message: '',
    }

    Object.assign(reportItemEntity, reportItem)

    reportItemEntity = await reportItemsRepo.save(reportItemEntity)

    Object.assign(reportEntity, defaultReportData, reportData)

    reportEntity.item = reportItemEntity
    reportEntity.reportedBy = user

    reportEntity = await reportsRepo.save(reportEntity)

    return reportEntity
  }

  async function removeReport(_, { reportId }): Promise<boolean> {
    const report = await getReport(reportId)
    await reportsRepo.remove(report)
    return true
  }

  async function setStatus(_, { reportId, newStatus }): Promise<ReportType> {
    const report = await getReport(reportId)
    report.status = newStatus
    await reportsRepo.save(report)

    return report
  }

  async function setPriority(_, { reportId, newPriority }): Promise<ReportType> {
    const report = await getReport(reportId)
    report.status = newPriority
    await reportsRepo.save(report)

    return report
  }

  return {
    reportsConnection,
    getReportResolver,
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
