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
      }, 10)
    })

    return this.gl
  }

  addMapillarySource(layer) {
    const map = layer._glMap

    if (map.getSource('mapillary')) {
      return
    }

    const mapillarySource = {
      type: 'vector',
      tiles: ['https://d25uarhxywzl1j.cloudfront.net/v0.1/{z}/{x}/{y}.mvt'],
      minzoom: 0,
      maxzoom: 14,
    }

    map.addSource('mapillary', mapillarySource)
  }

  addMapillaryLayer(layer) {
    const map = layer._glMap

    if (map.getLayer('mapillary')) {
      return
    }

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
