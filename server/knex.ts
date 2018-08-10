import knexfile from '../knexfile'
import cleanup from './util/cleanup'

const knex = require('knex')(knexfile)
export default knex

export async function migrate() {
  knex.migrate.latest()
}

cleanup(() => {
  knex.destroy()
})
