const ReportStatus = ['NEW', 'ACCEPTED', 'WIP', 'DONE', 'REJECTED']
const ReportPriority = ['LOW', 'HIGH', 'CRITICAL']

exports.up = async function(knex) {
  await knex.schema.createTable('Reporters', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('name').notNullable().unique()
    table.string('type').notNullable()
    table.jsonb('geoJSON').notNullable()
  })

  await knex.schema.createTable('ReportedItems', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.float('lat').notNullable()
    table.float('lon').notNullable()
    table.string('type').notNullable()
    table.string('entityIdentifier').notNullable()
    table.jsonb('data')
    table.integer('recommendedMapZoom')
    table.index(['entityIdentifier'], 'entities')
  })

  await knex.schema.createTable('Reports', table => {
    table.uuid('id').primary().defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('title').notNullable()
    table.text('message')
    table
      .uuid('reporter')
      .references('id')
      .inTable('Reporters')
    table
      .enum('status', ReportStatus)
      .defaultTo('NEW')
      .notNullable()
    table
      .enum('priority', ReportPriority)
      .defaultTo('LOW')
      .notNullable()
    table
      .uuid('item')
      .references('id')
      .inTable('ReportedItems')
    table.timestamps(true, true)
  })
}

exports.down = async function(knex) {
  await knex.schema.dropTable('Reports')
  await knex.schema.dropTable('ReportedItems')
  await knex.schema.dropTable('Reporters')
}
