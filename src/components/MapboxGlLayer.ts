import { withLeaflet, MapLayer, GridLayer } from 'react-leaflet/es'
import mapboxLeaflet from '../helpers/MapboxGlLeaflet'

@withLeaflet
class MapboxGlLayer extends GridLayer {
  gl

  createLeafletElement({ children, leaflet: { map } }) {
    // @ts-ignore
    this.gl = mapboxLeaflet({
      style: '/style.json',
      accessToken: 'none',
    }).addTo(map)

    return this.gl
  }
}

export default MapboxGlLayer
