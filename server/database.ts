import { get as _get } from 'lodash'
import knex, { migrate } from './knex'

interface RecordTypeContract {
  id: string
}

async function createDb<RecordType extends RecordTypeContract>(tableName) {
  async function get(id: string = null) {
    const table = knex(tableName)

    if (id) {
      return table.where('id', id)
    }

    return table.select('*')
  }

  async function add(item) {
    const table = knex(tableName)

    try {
      return table.insert(item, 'id').catch(err => {})
    } catch(err) {
      return []
    }
  }

  async function update(id, newValues) {
    const table = knex(tableName)

    try {
      return table
        .where('id', id)
        .update(newValues, 'id')
    } catch(err) {
      return []
    }
  }

  async function remove(id) {
    const table = knex(tableName)

    try {
      return table
        .where('id', id)
        .delete()
    } catch(err) {
      return []
    }
  }

  return {
    get,
    add,
    update,
    remove,
    table: () => knex(tableName),
  }
}

// TODO: Sort out database abstraction.
// Cannot select table once and re-use.

const database = async () => {
  await migrate()

  const tables = {
    report: await createDb('Reports'),
    reportItem: await createDb('ReportedItems'),
    reporter: await createDb('Reporters'),
  }

  function table(tableName) {
    return _get(tables, tableName)
  }

  return {
    table,
  }
}

export default database
