import { DateTime } from 'luxon'
import got from 'got'
import neatCsv from 'neat-csv'
import GeoJSON from 'geojson'

type UnconnectedStop = {
  stop_code: string
  jore_lat: string
  jore_lon: string
  departures: string
}

const csvUrl = 'http://api.digitransit.fi/routing-data/v2/hsl/unconnected.csv'
let lastFetchedCsv = ''
let lastFetchedAt: DateTime = null

const UnconnectedStopsReporter = async () => {
  if (
    !lastFetchedCsv || // if there is not a fetched CSV
    (!!lastFetchedAt && lastFetchedAt < DateTime.local().minus({ days: 1 })) // ...that is newer than one day...
  ) {
    // Fetch a new CSV of unconnected stops.
    const csvRequest = await got(csvUrl)
    lastFetchedCsv = csvRequest.body
    lastFetchedAt = DateTime.local()
  }

  const unconnectedStopsData: UnconnectedStop[] = await neatCsv(lastFetchedCsv)

  // @ts-ignore
  const stopsGeoJson = GeoJSON.parse(unconnectedStopsData, {
    Point: ['jore_lat', 'jore_lon'],
    include: ['stop_code'],
  })

  return JSON.stringify(stopsGeoJson)
}

export default UnconnectedStopsReporter
