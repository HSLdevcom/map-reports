import { get as _get } from 'lodash'
import knex, { migrate } from './knex'

interface RecordTypeContract {
  id: string
}

async function createDb<RecordType extends RecordTypeContract>(table) {
  async function get(id: string = null) {
    if (id) {
      return table.where('id', id)
    }

    return table.select('*')
  }

  async function add(item) {
    try {
      return table.insert(item, 'id').catch(err => {})
    } catch(err) {
      return []
    }
  }

  async function update(id, newValues) {
    try {
      return table
        .where('id', id)
        .update(newValues, 'id')
    } catch(err) {
      return []
    }
  }

  async function updateOrAdd(id, item) {
    try {
      const record = table.where('id', id).select('id')

      if (record) {
        return table.where('id', id).update(item, 'id')
      }

      return table.insert(item, 'id')
    } catch(err) {
      return []
    }
  }

  async function remove(id) {
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
    updateOrAdd,
    remove,
    table,
  }
}

// TODO: Sort out database abstraction.
// Cannot select table once and re-use.

const database = async () => {
  await migrate()

  const tables = {
    report: await createDb(knex('Reports')),
    reportItem: await createDb(knex('ReportedItems')),
    reporter: await createDb(knex('Reporters')),
  }

  function table(tableName) {
    return _get(tables, tableName)
  }

  return {
    table,
  }
}

export default database
