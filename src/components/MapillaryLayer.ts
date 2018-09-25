import { withLeaflet, MapLayer, GridLayer } from 'react-leaflet/es'
import mapboxLeaflet from '../helpers/MapboxGlLeaflet'

class MapillaryLayer extends MapLayer {
  gl

  createLeafletElement() {
    // @ts-ignore
    this.gl = mapboxLeaflet({
      style: '/simple-style.json',
      accessToken: 'none',
    })

    this.gl.on('add', ({ target }) => {
      setTimeout(() => {
        this.addMapillarySource(target)
        this.addMapillaryLayer(target)
      }, 0)
    })

    return this.gl
  }

  addMapillarySource(layer) {
    const mapillarySource = {
      type: 'vector',
      tiles: ['https://d25uarhxywzl1j.cloudfront.net/v0.1/{z}/{x}/{y}.mvt'],
      minzoom: 0,
      maxzoom: 14,
    }

    layer._glMap.addSource('mapillary', mapillarySource)
  }

  addMapillaryLayer(layer) {
    layer._glMap.addLayer({
      id: 'mapillary',
      type: 'line',
      source: 'mapillary',
      'source-layer': 'mapillary-sequences',
      layout: {
        'line-cap': 'round',
        'line-join': 'round',
      },
      paint: {
        'line-opacity': 0.6,
        'line-color': 'rgb(50, 200, 200)',
        'line-width': 2,
      },
    })
  }
}

export default withLeaflet(MapillaryLayer)
