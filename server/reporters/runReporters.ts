import knex from '../knex'

export default async (reporters, database) => {
  const reporterDb = knex('Reporters')
  return reporterDb
    .select()
    .then(async reporterRecords => {
      console.log(reporterRecords)

      // TODO: Sort out database abstraction

      for (const record of reporterRecords) {
        const reporter = reporters.find(r => r.name === record.name)

        if (reporter) {
          const reporterId = record.id

          console.log(`Running reporter ${reporter.name} with id ${reporterId}`)

          const result = reporter.run()
          await reporterDb.update(reporterId, { geoJSON: result })
        }
      }
    })
}
