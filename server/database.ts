import { get as _get, merge } from 'lodash'
import knex, { migrate } from './knex'

interface RecordTypeContract {
  id: string
}

function createDb<RecordType extends RecordTypeContract>(table) {
  async function get(id: string = null) {
    if (id) {
      return table.where('id', id).select()
    }

    return table.select()
  }

  async function add(item) {
    return table.insert(item)
  }

  async function update(id, newValues) {
    return table.where('id', id).update(newValues)
  }

  async function updateOrAdd(id, item) {
    const record = table.where('id', id).select('id')

    if(record) {
      return table.where('id', id).update(item)
    }

    return table.insert(item)
  }

  async function remove(id) {
    return table.where('id', id).delete()
  }

  return {
    get,
    add,
    update,
    updateOrAdd,
    remove,
  }
}

const database = () => {
  migrate().then(() => console.log('Database migrated.'))

  const tables = {
    report: createDb(knex('Reports')),
    reportItem: createDb(knex('ReportedItems')),
    reporter: createDb(knex('Reporters')),
    datasets: createDb(knex('Datasets')),
  }

  function table(tableName) {
    return _get(tables, tableName)
  }

  return {
    table,
  }
}

export default database
