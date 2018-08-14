export default async (reporters, database) => {
  const reporterDb = database.table('reporter')
  const existingReporters = await reporterDb.get()

  const newRecords = reporters
    .filter(reporter => !existingReporters.find(record => record.name === reporter.name))
    .map(({ name, type }) => ({
      name,
      type,
      geoJSON: '{}',
    }))

  if(newRecords) {
    return reporterDb.add(newRecords)
  }

  return []
}
