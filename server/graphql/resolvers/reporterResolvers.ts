const reporterResolvers = (db) => {
  const reporterDb = db.table('reporter')

  async function allReporters() {
    return reporterDb.get()
  }

  async function resolveReportReporter(report) {
    const reporters = await allReporters()
    return reporters.find(rep => rep.id === report.reporter) || 'NO REPORTER'
  }

  return {
    allReporters,
    resolveReportReporter,
  }
}

export default reporterResolvers
