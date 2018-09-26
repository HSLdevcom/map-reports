import got from 'got'
import { get } from 'lodash'
import neatCsv from 'neat-csv'
import GeoJSON from '../../shared/utils/geojson'

async function runInspections(inspections, database) {
  async function runGeoJsonInspection(inspection) {
    const geoJsonRequest = await got(inspection.datasetUri)
    return get(geoJsonRequest, 'body', {})
  }

  async function runCSVInspection(inspection) {
    const csvRequest = await got(inspection.datasetUri)
    const csvText = get(csvRequest, 'body', '')
    const data = await neatCsv(csvText)

    // @ts-ignore
    return GeoJSON.parse(data, get(inspection, 'geoJSONProps', {}))
  }

  for (const inspection of inspections) {
    if (inspection) {
      const { datasetType, id, name, geoJSONProps } = inspection
      console.log(`Running inspection ${name} with id ${id}`)

      let result = {}

      if (datasetType === 'geojson') {
        result = await runGeoJsonInspection(inspection)
        console.log(result)
      }

      if (datasetType === 'csv' && geoJSONProps) {
        result = await runCSVInspection(inspection)
      }

      await database.update(id, { geoJSON: result })
    }
  }
}

export default runInspections
