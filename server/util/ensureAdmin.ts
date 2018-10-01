import { User } from '../entity/User'

export async function ensureAdmin(connection) {
  let adminUser = await connection.manager.findOne(User, { name: 'Admin' })

  if (!adminUser) {
    adminUser = new User()
    adminUser.name = 'Admin'
    adminUser.email = 'daniel@developsuperpowers.com'
    adminUser.password = '123'
    adminUser.roles = ['admin']

    await connection.manager.save(adminUser)
  }

  return adminUser
}
