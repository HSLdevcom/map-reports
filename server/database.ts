import { createConnection, EntitySchema } from 'typeorm'
import { ensureAdmin } from './util/ensureAdmin'
import { User } from './entity/User'

const database = async () => {
  const connection = await createConnection({
    type: 'postgres',
    host: 'localhost',
    port: 5432,
    username: 'postgres',
    password: 'mysecretpassword',
    database: 'postgres',
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
