import { get as _get } from 'lodash'
import knex, { migrate } from './knex'
import { AnyFunction } from '../shared/types/AnyFunction'

interface RecordTypeContract {
  id: string
}

type ReturningType = string | string[]
type DbResponse = any | any[]

export interface DatabaseRepository {
  get: (id?: string) => Promise<DbResponse>
  add: (item: any, returning?: ReturningType) => Promise<DbResponse>
  update: (id: string, newValues: any[], returning?: ReturningType) => Promise<DbResponse>
  remove: (id: string) => Promise<DbResponse>
  table: AnyFunction
}

async function createDb<RecordType extends RecordTypeContract>(
  tableName
): Promise<DatabaseRepository> {
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
      return table.insert(item, returning)
    } catch (err) {
      console.log(err)
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

export interface DatabaseWrapper {
  table: (tableName: string) => DatabaseRepository
}

const database = async (): Promise<DatabaseWrapper> => {
  await migrate()

  const tables = {
    report: await createDb('Reports'),
    reportItem: await createDb('ReportedItems'),
    inspection: await createDb('Inspections'),
    comment: await createDb('Comments'),
    user: await createDb('Users'),
  }

  function table(tableName) {
    return _get(tables, tableName)
  }

  return {
    table,
  }
}

export default database
