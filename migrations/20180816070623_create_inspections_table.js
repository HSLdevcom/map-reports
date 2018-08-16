const InspectionType = ['cron', 'one-time', 'manual']
const DatasetType = ['geojson', 'csv']

exports.up = async function(knex) {
  await knex.schema.createTable('Inspections', table => {
    table
      .uuid('id')
      .primary()
      .defaultTo(knex.raw('uuid_generate_v4()'))
    table.string('name').notNullable()
    table
      .enum('type', InspectionType)
      .defaultTo('cron')
      .notNullable()
    table
      .enum('datasetType', DatasetType)
      .defaultTo('cron')
      .notNullable()
    table.string('datasetUri')
    table.string('cron')
    table.jsonb('convertData')
    table.timestamps(true, true)
  })
}

exports.down = async function(knex) {
  await knex.schema.dropTable('Inspections')
}
