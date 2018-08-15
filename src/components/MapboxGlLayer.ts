import { withLeaflet, MapLayer, GridLayer } from 'react-leaflet/es'
import L from 'leaflet'
import 'mapbox-gl-leaflet'

@withLeaflet
class MapboxGlLayer extends GridLayer {
  gl

  createLeafletElement({ children, leaflet: { map } }) {
    // @ts-ignore
    this.gl = L.mapboxGL({
      style: '/style.json',
      accessToken: 'none',
    }).addTo(map)

    return this.gl
  }

  updateLeafletElement(fromProps, toProps) {
    //console.log(fromProps, toProps)
    //console.dir(this.gl._offset)

    return {}
  }

  onRemove() {
    console.log('derp')
  }
}

export default MapboxGlLayer
