import { merge } from 'lodash'
import { Report, ReportPriority, ReportStatus } from '../../shared/types/Report'
import { generate } from 'shortid'
import { ReportDataInput } from '../../shared/types/CreateReportData'

export function createReport(reportData: ReportDataInput, reportItemId: string): Report {
  // Merge the received report data with some defaults for potentially
  // unsubmitted data and add props that only the server should add.
  return merge(
    {
      priority: ReportPriority.LOW,
      status: ReportStatus.NEW,
      message: '',
      item: reportItemId,
    },
    reportData
  )
}
