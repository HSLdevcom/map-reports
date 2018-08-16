const InspectionType = ['cron', 'onetime', 'manual']
const DatasetType = ['geojson', 'csv', 'none']

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
    table.enum('datasetType', DatasetType).defaultTo('none')
    table.string('datasetUri')
    table.string('cron')
    table.jsonb('convertData')
    table.jsonb('geoJSON')
    table.timestamps(true, true)
  })
}

exports.down = async function(knex) {
  await knex.schema.dropTable('Inspections')
}
