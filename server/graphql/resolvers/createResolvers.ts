import reportResolvers from './reportResolvers'
import reporterResolvers from './reporterResolvers'

const createResolvers = (db): any => {
  const reports = reportResolvers(db)
  const reporters = reporterResolvers(db)

  return {
    Query: {
      // Reports
      reports: reports.allReports,
      reportFilterOptions: reports.reportFilterOptions,
      reportsConnection: reports.reportsConnection,

      // Reporters
      reporters: reporters.allReporters,
      reporter: reporters.getReporter
    },
    Mutation: {
      // Reports
      createReport: reports.createReport,
      removeReport: reports.removeReport,
      setStatus: reports.setStatus,
      setPriority: reports.setPriority,
    },
    Report: {
      reporter: reporters.resolveReportReporter,
    },
    Reporter: {
      geoJSON: (reporter) => {
        return JSON.stringify(reporter.geoJSON)
      }
    }
  }
}

export default createResolvers
