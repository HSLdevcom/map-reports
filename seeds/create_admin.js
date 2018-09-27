exports.seed = async function(knex) {
  const existingAdmin = await knex('Users').where({ name: 'Admin', group: 'admin' })

  if (existingAdmin.length === 0) {
    await knex('Users').insert([
      {
        name: 'Admin',
        email: 'daniel@developsuperpowers.com',
        password: '123',
        group: 'admin',
      },
    ])
  }
}
