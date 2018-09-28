import reportResolvers from './reportResolvers'
import commentResolvers from './commentResolvers'
import inspectionResolvers from './inspectionResolvers'

const createResolvers = (db): any => {
  const reports = reportResolvers(db)
  const inspections = inspectionResolvers(db)
  const comments = commentResolvers(db)

  return {
    Query: {
      // Reports
      report: reports.getReport,
      reports: reports.allReports,
      reportItems: reports.allReportItems,
      reportFilterOptions: reports.reportFilterOptions,
      reportsConnection: reports.reportsConnection,

      // Inspections
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
      createComment: comments.createComment,
      removeComment: comments.removeComment,
    },
    Report: {
      item: reports.resolveReportItem,
      comments: comments.resolveCommentsForReport,
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
