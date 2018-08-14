export default async (reporters, database) => {
  const reporterDb = database.table('reporter')
  const reporterRecords = await reporterDb.get()

  for (const record of reporterRecords) {
    const reporter = reporters.find(r => r.name === record.name)

    if (reporter && typeof reporter.run === 'function') {
      const reporterId = record.id

      console.log(`Running reporter ${reporter.name} with id ${reporterId}`)

      const result = reporter.run()
      await reporterDb.update(reporterId, { geoJSON: result })
    }
  }
}
