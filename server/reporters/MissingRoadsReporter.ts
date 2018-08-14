import { DateTime } from 'luxon'
import fs from 'fs-extra'
import { merge } from '@mapbox/geojson-merge'
import path from 'path'

const MissingRoadsReporter = async () => {
  const missingRoadsGeoJson = await fs.readJSON(
    path.join(__dirname, 'assets/osm_puuttuvat_tiet.geojson')
  )

  return missingRoadsGeoJson
}

export default MissingRoadsReporter
