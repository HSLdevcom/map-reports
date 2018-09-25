import geoJson from '../../shared/utils/geojson'
import neatCsv from 'neat-csv'
import { get } from 'lodash'

async function fetchSampleAsGeoJSON(fetchUrl, mapToGeoJSON) {
  let url = fetchUrl

  try {
    url = new URL(fetchUrl).href
  } catch (err) {
    url = ''
  }

  if (url) {
    const datasetReq = await fetch(url)
    const datasetText = await datasetReq.text()
    let dataset

    try {
      dataset = JSON.parse(datasetText)
    } catch (err) {
      dataset = await neatCsv(datasetText)
      dataset = geoJson.parse(dataset, JSON.parse(mapToGeoJSON))
    }

    const sample = get(
      dataset,
      'features[0].properties',
      get(dataset, 'properties', get(dataset, '[0]', false))
    )

    if (sample) {
      return sample
    }
  }

  return {}
}

export default fetchSampleAsGeoJSON
