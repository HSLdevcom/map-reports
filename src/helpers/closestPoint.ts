import { LineString, MultiLineString, Position } from 'geojson'
import { LatLng, latLng, LatLngExpression } from 'leaflet'

type AcceptedGeometries = LineString | MultiLineString

export function closestPointInGeometry(
  queryPoint: LatLngExpression,
  geometry: AcceptedGeometries
) {
  const queryLatLng = latLng(queryPoint)

  if (geometry.type === 'LineString') {
    return closestPointOnLine(queryLatLng, geometry.coordinates)
  } else if (geometry.type === 'MultiLineString') {
    return geometry.coordinates.reduce((closestPoint, lineGeometry) => {
      const closestOnLine = closestPointOnLine(queryLatLng, lineGeometry)

      if (queryLatLng.distanceTo(closestOnLine) < queryLatLng.distanceTo(closestPoint)) {
        return closestOnLine
      }

      return closestPoint
    }, queryLatLng)
  }

  return false
}

function closestPointOnLine(queryPoint: LatLng, lineGeometry: Position[]): LatLng {
  let prevDistance = 10
  let closestPoint = queryPoint

  for (let i = 0; i < lineGeometry.length; i++) {
    const [lng, lat] = lineGeometry[i]
    const distanceFromQuery = distanceBetween(queryPoint.lat, queryPoint.lng, lat, lng)

    if (distanceFromQuery < prevDistance) {
      prevDistance = distanceFromQuery
      closestPoint = latLng([lat, lng])
    }
  }

  return closestPoint
}

// From http://stackoverflow.com/a/18883823/5710637
function distanceBetween(lat1, lon1, lat2, lon2) {
  const R = 6371 // km
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const radLat1 = toRad(lat1)
  const radLat2 = toRad(lat2)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(radLat1) * Math.cos(radLat2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const d = R * c
  return d
}

// Converts numeric degrees to radians
// From http://stackoverflow.com/a/18883823/5710637
function toRad(Value) {
  return (Value * Math.PI) / 180
}
