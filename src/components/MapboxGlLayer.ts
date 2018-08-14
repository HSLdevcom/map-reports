import { withLeaflet, MapLayer } from 'react-leaflet/es'
import L from 'leaflet'
import 'mapbox-gl-leaflet'

@withLeaflet
class MapboxGlLayer extends MapLayer {
  createLeafletElement({ children, leaflet: { map } }) {
    // @ts-ignore
    const gl = L.mapboxGL({
      style: '/style.json',
      accessToken: 'none',
    }).addTo(map)

    return gl
  }
}

export default MapboxGlLayer
