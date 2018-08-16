import got from 'got'
import { get } from 'lodash'

export default async (inspections, database) => {
  async function runGeoJsonInspection(inspection) {
    const geoJsonRequest = await got(inspection.datasetUri)
    console.log(geoJsonRequest)
    return get(geoJsonRequest, 'data', {})
  }

  for (const inspectionIndex of inspections) {
    const inspection = inspections[inspectionIndex]

    if (inspection) {
      const { datasetType, id, name } = inspection
      console.log(`Running inspection ${name} with id ${id}`)

      let result = {}

      if (datasetType === 'geojson') {
        result = await runGeoJsonInspection(inspection)
      }

      console.log(result)

      await database.update(id, { geoJSON: result })
    }
  }
}
