import { withLeaflet, MapLayer, GridLayer } from 'react-leaflet/es'
import mapboxLeaflet from '../helpers/MapboxGlLeaflet'

class MapboxGlLayer extends MapLayer {
  createLeafletElement({ children, leaflet: { map } }) {
    // @ts-ignore
    const gl = mapboxLeaflet({
      style: '/style.json',
      accessToken: 'none',
    })

    return gl
  }
}

export default withLeaflet(MapboxGlLayer)
