import got from 'got'
import { get } from 'lodash'
import neatCsv from 'neat-csv'
import GeoJSON from '../../shared/utils/geojson'
import { Inspection } from '../../shared/types/Inspection'

async function runInspections(inspections: Inspection[], repo) {
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

      inspection.geoJSON = result
      await repo.save(inspection)
    }
  }
}

export default runInspections
