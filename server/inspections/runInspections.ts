import got from 'got'
import { get } from 'lodash'
import neatCsv from 'neat-csv'
import GeoJSON from 'geojson'

async function runInspections(inspections, database) {
  async function runGeoJsonInspection(inspection) {
    const geoJsonRequest = await got(inspection.datasetUri)
    return get(geoJsonRequest, 'data', {})
  }

  async function runCSVInspection(inspection) {
    const csvRequest = await got(inspection.datasetUri)
    const csvText = get(csvRequest, 'body', '')
    const data = await neatCsv(csvText)

    // @ts-ignore
    return GeoJSON.parse(data, get(inspection, 'convertData', {}))
  }

  for (const inspection of inspections) {
    if (inspection) {
      const { datasetType, id, name, convertData } = inspection
      console.log(`Running inspection ${name} with id ${id}`)

      let result = {}

      if (datasetType === 'geojson') {
        result = await runGeoJsonInspection(inspection)
      }

      if (datasetType === 'csv' && convertData) {
        result = await runCSVInspection(inspection)
      }

      console.log(result)

      await database.update(id, { geoJSON: result })
    }
  }
}

export default runInspections
