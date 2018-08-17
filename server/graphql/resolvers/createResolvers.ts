import reportResolvers from './reportResolvers'
import reporterResolvers from './reporterResolvers'
import inspectionResolvers from './inspectionResolvers'
import { Inspection } from 'bluebird'

const createResolvers = (db): any => {
  const reports = reportResolvers(db)
  const reporters = reporterResolvers(db)
  const inspections = inspectionResolvers(db)

  return {
    Query: {
      // Reports
      reports: reports.allReports,
      reportFilterOptions: reports.reportFilterOptions,
      reportsConnection: reports.reportsConnection,

      // Reporters
      reporters: reporters.allReporters,
      reporter: reporters.getReporter,
      inspections: inspections.allInspections,
      inspection: inspections.getInspection,
    },
    Mutation: {
      // Reports
      createReport: reports.createReport,
      removeReport: reports.removeReport,
      setStatus: reports.setStatus,
      setPriority: reports.setPriority,
      createInspection: inspections.createInspection,
    },
    Report: {
      item: reports.resolveReportItem,
    },
    ReportItem: {
      data: reportItem => {
        try {
          return JSON.stringify(reportItem.data)
        } catch (err) {
          return '{}'
        }
      },
    },
    Reporter: {
      geoJSON: reporter => {
        return JSON.stringify(reporter.geoJSON)
      },
    },
    Inspection: {
      geoJSON: inspection => {
        return JSON.stringify(inspection.geoJSON)
      },
      geoJSONProps: inspection => {
        return JSON.stringify(inspection.geoJSONProps)
      },
    },
  }
}

export default createResolvers
