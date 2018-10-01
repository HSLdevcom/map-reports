import neatCsv from 'neat-csv'

async function fetchSampleCsv(fetchUrl: string) {
  let url = fetchUrl

  try {
    url = new URL(url).href
  } catch (err) {
    url = ''
  }

  if (url) {
    const datasetReq = await fetch(url)
    const datasetCsv = await datasetReq.text()
    const dataset = await neatCsv(datasetCsv)

    const sample = Array.isArray(dataset) ? dataset[0] : dataset[Object.keys(dataset)[0]]

    return sample
  }

  return null
}

export default fetchSampleCsv
