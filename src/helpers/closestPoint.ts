import { Feature, LineString, MultiLineString, Position } from 'geojson'
import { LatLng, latLng, LatLngExpression } from 'leaflet'

type AcceptedGeometries = LineString | MultiLineString
type ReturnType = LatLng | false

export function closestPointInGeometry(
  queryPoint: LatLngExpression,
  geometry: AcceptedGeometries
) {
  const queryLatLng = latLng(queryPoint)

  if (geometry.type === 'LineString') {
    return closestPointOnLine(queryLatLng, geometry.coordinates)
  } else if (geometry.type === 'MultiLineString') {
    return closestPointCompareReducer(
      geometry.coordinates,
      coordinate => closestPointOnLine(queryLatLng, coordinate),
      queryLatLng
    )
  }

  return false
}

export function closestPointCompareReducer(
  collection: any[],
  getCandidate: (any) => ReturnType,
  latlng: LatLng
) {
  return collection.reduce<ReturnType>((current, item) => {
    const pointCandidate = getCandidate(item)

    if (
      !current ||
      (!!pointCandidate && latlng.distanceTo(pointCandidate) < latlng.distanceTo(current))
    ) {
      return pointCandidate
    }

    return current
  }, false)
}

function closestPointOnLine(queryPoint: LatLng, lineGeometry: Position[]) {
  let prevDistance = 10
  let closestPoint: ReturnType = false

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
