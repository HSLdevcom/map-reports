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
    return geometry.coordinates.reduce<false | LatLng>((closestPoint, lineGeometry) => {
      const closestOnLine = closestPointOnLine(queryLatLng, lineGeometry)

      if (
        !closestPoint ||
        (!!closestOnLine &&
          queryLatLng.distanceTo(closestOnLine) < queryLatLng.distanceTo(closestPoint))
      ) {
        return closestOnLine
      }

      return closestPoint
    }, false)
  }

  return false
}

function closestPointOnLine(queryPoint: LatLng, lineGeometry: Position[]) {
  let prevDistance = 10
  let closestPoint: false | LatLng = false

  for (let i = 0; i < lineGeometry.length; i++) {
    const [lng, lat] = lineGeometry[i]
    const distanceFromQuery = queryPoint.distanceTo([lat, lng])

    if (distanceFromQuery < prevDistance) {
      prevDistance = distanceFromQuery
      closestPoint = latLng([lat, lng])
    }
  }

  return closestPoint
}
