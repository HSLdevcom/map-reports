import { withLeaflet, MapLayer, GridLayer } from 'react-leaflet/es'
import mapboxLeaflet from '../helpers/MapboxGlLeaflet'

class MapboxGlLayer extends MapLayer {
  gl

  createLeafletElement({ children, leaflet: { map } }) {
    // @ts-ignore
    this.gl = mapboxLeaflet({
      style: '/style.json',
      accessToken: 'none',
    })

    return this.gl
  }
}

export default withLeaflet(MapboxGlLayer)
