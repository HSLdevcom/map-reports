import { get as _get } from 'lodash'
import knex, { migrate } from './knex'

interface RecordTypeContract {
  id: string
}

async function createDb<RecordType extends RecordTypeContract>(tableName) {
  async function get(id: string = null) {
    const table = knex(tableName)

    if (id) {
      return table.where('id', id).first()
    }

    return table.select()
  }

  async function add(item, returning = 'id') {
    const table = knex(tableName)

    try {
      return table.insert(item, returning).catch(err => {})
    } catch (err) {
      return []
    }
  }

  async function update(id, newValues, returning = 'id') {
    const table = knex(tableName)

    try {
      return table.where('id', id).update(newValues, returning)
    } catch (err) {
      return []
    }
  }

  async function remove(id) {
    const table = knex(tableName)

    try {
      return table.where('id', id).delete()
    } catch (err) {
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
    inspections: await createDb('Inspections'),
  }

  function table(tableName) {
    return _get(tables, tableName)
  }

  return {
    table,
  }
}

export default database
