import get from 'lodash/get'
import knex from '../knex'
import pMap from 'p-map'

export default async (reporters, database) => {
  const reporterDb = database.table('reporter')

  await knex.transaction(async trx => {
    return pMap(reporters, reporter => {
      return reporterDb.table
        .transacting(trx)
        .where('name', reporter.name)
        .select('id')
        .then(reporterRecord => {
          if (reporterRecord.length > 0) {
            const reporterId = get(reporterRecord, '[0].id', '')

            console.log(reporterId)

            if (reporterId) {
              console.log(`Running reporter ${reporter.name} with id ${reporterId}`)

              const result = reporter.run()
              return database.update(reporterId, { geoJSON: result }, trx)
            }
          }
        })
    }).then(trx.commit)
  })
}
