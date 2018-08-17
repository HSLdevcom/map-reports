import reportResolvers from './reportResolvers'
import inspectionResolvers from './inspectionResolvers'

const createResolvers = (db): any => {
  const reports = reportResolvers(db)
  const inspections = inspectionResolvers(db)

  return {
    Query: {
      // Reports
      reports: reports.allReports,
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
