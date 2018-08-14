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
    const reporter = await reporterDb.get(reporterId)
    return reporter[0]
  }

  async function resolveReportReporter(report) {
    const reporters = await allReporters()
    return reporters.find(rep => rep.id === report.reporter) || 'NO REPORTER'
  }

  return {
    allReporters,
    getReporter,
    resolveReportReporter,
  }
}

export default reporterResolvers
