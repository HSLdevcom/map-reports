import { LatLngExpression } from 'leaflet'

// From https://gis.stackexchange.com/a/2980

export function offsetPosition(
  latlng: LatLngExpression,
  offsetX: number,
  offsetY: number = offsetX
) {
  let lat
  let lng

  // Earth’s radius, sphere
  const R = 6378137

  if (Array.isArray(latlng)) {
    lat = latlng[0]
    lng = latlng[1]
  } else {
    lat = latlng.lat
    lng = latlng.lng
  }

  // Coordinate offsets in radians
  const offsetLat = offsetX / R
  const offsetLng = offsetY / (R * Math.cos((Math.PI * lat) / 180))

  const newLat = lat + (offsetLat * 180) / Math.PI
  const newLng = lng + (offsetLng * 180) / Math.PI

  return { lat: newLat, lng: newLng }
}
