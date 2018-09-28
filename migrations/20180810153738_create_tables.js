exports.up = async function(knex) {
  await knex.schema.createTable('Users', table => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'))
    table.text('name').notNullable()
    table
      .string('email')
      .notNullable()
      .unique()
    table.text('password').notNullable()
    table.string('group').notNullable()
    table.timestamps(true, true)
  })

  await knex.schema.createTable('ReportedItems', table => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'))
    table.float('lat').notNullable()
    table.float('lon').notNullable()
    table.string('type').notNullable()
    table.string('entityIdentifier').notNullable()
    table.jsonb('data')
    table.integer('recommendedMapZoom')
    table.index(['entityIdentifier'], 'entities')
  })

  await knex.schema.createTable('Inspections', table => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('name').notNullable()
    table
      .string('type')
      .defaultTo('cron')
      .notNullable()
    table.string('datasetType').defaultTo('none')
    table.string('datasetUri')
    table.string('cron')
    table.string('entityIdentifier')
    table.jsonb('geoJSONProps')
    table.jsonb('geoJSON')
    table.timestamps(true, true)
  })

  await knex.schema.createTable('Reports', table => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('title').notNullable()
    table.text('message')
    table
      .string('status', 20)
      .defaultTo('NEW')
      .notNullable()
    table
      .string('priority', 20)
      .defaultTo('LOW')
      .notNullable()
    table
      .uuid('item')
      .references('id')
      .inTable('ReportedItems')
    table
      .uuid('inspection')
      .references('id')
      .inTable('Inspections')
    table
      .uuid('user')
      .references('id')
      .inTable('Users')
    table.timestamps(true, true)
  })

  await knex.schema.createTable('Comments', table => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'))
    table.text('body').notNullable()
    table
      .uuid('user')
      .references('id')
      .inTable('Users')
      .notNullable()
    table
      .uuid('report')
      .references('id')
      .inTable('Reports')
      .onDelete('CASCADE') // Delete comment when report is deleted.
      .notNullable()
    table.timestamps(true, true)
  })
}

exports.down = async function(knex) {
  await knex.schema.dropTable('Comments')
  await knex.schema.dropTable('Reports')
  await knex.schema.dropTable('ReportedItems')
  await knex.schema.dropTable('Inspections')
  await knex.schema.dropTable('Users')
}