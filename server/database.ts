import { createConnection, EntitySchema } from 'typeorm'
import { ensureAdmin } from './util/ensureAdmin'
import { User } from './entity/User'
import { parse } from './util/parsePostgresConnectionString'

const database = async () => {
  const connectionString = process.env.PG_CONNECTION_STRING

  const defaultConnection = {
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'mysecretpassword',
    database: 'postgres',
  }

  const pgConnection = connectionString ? parse(connectionString) : defaultConnection

  const connection = await createConnection({
    ...pgConnection,
    type: 'postgres',
    synchronize: true,
    logging: false,
    entities: [__dirname + '/entity/*.ts'],
  })

  await ensureAdmin(connection)

  function getRepo(entity: EntitySchema) {
    return connection.getRepository(entity)
  }

  async function getAdmin() {
    return connection.manager.findOne(User, { name: 'Admin' })
  }

  return {
    getRepo,
    getAdmin,
    connection,
  }
}

export default database
