import { withLeaflet, MapLayer, GridLayer } from 'react-leaflet/es'
import mapboxLeaflet from '../helpers/MapboxGlLeaflet'
import { stringify } from '../helpers/simpleQs'

class MapboxGlLayer extends MapLayer {
  gl

  createLeafletElement() {
    const style = {
      routes: true,
      municipal_borders: true,
      text_fisv: true,
      print: false,
    }

    // @ts-ignore
    this.gl = mapboxLeaflet({
      style: '/style.json?' + stringify(style),
      accessToken: 'none',
    })

    return this.gl
  }
}

export default withLeaflet(MapboxGlLayer)
