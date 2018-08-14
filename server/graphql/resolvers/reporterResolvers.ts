import { Reporter } from '../../../types/Reporter'

const reporterResolvers = (db) => {
  const reporterDb = db.table('reporter')

  async function allReporters(_?, args?) {
    const { onlyWithGeoJSON = false } = args
    const reporters = await reporterDb.get()

    if(onlyWithGeoJSON) {
      return reporters.filter(r => r.geoJSON && Object.keys(r.geoJSON).length > 0)
    }

    return reporters
  }

  async function getReporter(_, { reporterId = '' }) {
    return reporterDb.get(reporterId)
  }

  async function resolveReportReporter(report): Promise<Reporter> {
    if (typeof report.reporter === 'string') {
      return reporterDb.get(report.reporter)
    }

    return report.reporter
  }

  return {
    allReporters,
    getReporter,
    resolveReportReporter,
  }
}

export default reporterResolvers
