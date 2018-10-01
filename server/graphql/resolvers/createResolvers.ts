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
      report: reports.getReportResolver,
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
    ReportItem: {
      data: reportItem => {
        if (typeof reportItem.data !== 'string') {
          return JSON.stringify(reportItem.data)
        }

        return reportItem.data
      },
    },
    Inspection: {
      geoJSON: inspection => {
        if (typeof inspection.geoJSON !== 'string') {
          return JSON.stringify(inspection.geoJSON)
        }

        return inspection.geoJSON
      },
      geoJSONProps: inspection => {
        if (typeof inspection.geoJSONProps !== 'string') {
          return JSON.stringify(inspection.geoJSONProps)
        }

        return inspection.geoJSONProps
      },
    },
  }
}

export default createResolvers
