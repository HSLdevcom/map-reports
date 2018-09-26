import { withLeaflet, MapLayer, GridLayer } from 'react-leaflet/es'
import mapboxLeaflet from '../helpers/MapboxGlLeaflet'
import {
  closestPointInGeometry,
  closestPointCompareReducer,
} from '../helpers/closestPoint'
import { LatLngLiteral } from 'leaflet'
import { AnyFunction } from '../../shared/types/AnyFunction'

interface Props {
  layerIsActive: boolean
  onSelectLocation: AnyFunction
}

class MapillaryLayer extends MapLayer<Props> {
  gl = null
  highlightedLocation: boolean | LatLngLiteral = false

  createLeafletElement(props) {
    // @ts-ignore
    this.gl = mapboxLeaflet({
      style: '/simple-style.json',
      accessToken: 'none',
    })

    this.gl.on('add', ({ target }) => {
      const leafletMap = target._map

      // Wait for the gl stuff to be added
      setTimeout(() => {
        const map = target._glMap

        leafletMap.on('mousemove', this.onHover(leafletMap, map))

        leafletMap.on('click', () => {
          props.onSelectLocation(this.highlightedLocation)
        })

        // ...and wait for the gl stuff to load
        map.on('load', () => {
          this.addMapillarySource(map)
          this.addMapillaryLayer(map)
        })
      }, 0)
    })

    return this.gl
  }

  addMapillarySource(map) {
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

  addMapillaryLayer(map) {
    if (map.getLayer('mapillary')) {
      return
    }

    const currentYear = new Date().getFullYear()
    const minDate = new Date(currentYear - 1, 0, 1).getTime()

    map.addLayer({
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
      filter: ['>=', 'captured_at', minDate],
    })
  }

  onHover = (leafletMap, glMap) => e => {
    const { containerPoint, latlng } = e

    const pointX = containerPoint.x
    const pointY = containerPoint.y

    const bbox = [{ x: pointX - 20, y: pointY - 20 }, { x: pointX + 20, y: pointY + 20 }]

    const features = glMap.queryRenderedFeatures(bbox, {
      layers: ['mapillary'],
    })

    if (features.length !== 0) {
      let featurePoint = closestPointCompareReducer(
        features,
        feature => closestPointInGeometry(latlng, feature.toJSON().geometry),
        latlng
      )

      this.highlightedLocation = featurePoint

      featurePoint = featurePoint && !featurePoint.equals(latlng) ? featurePoint : false
      this.highlightMapillaryPoint(glMap, featurePoint)
    }
  }

  highlightMapillaryPoint = (glMap, position: LatLngLiteral | boolean) => {
    if (typeof position !== 'boolean') {
      const pointSource = glMap.getSource('mapillary_point')

      if (!pointSource) {
        glMap.addSource('mapillary_point', {
          type: 'geojson',
          data: this.getPointData(position),
        })
      } else {
        requestAnimationFrame(() => {
          pointSource.setData(this.getPointData(position))
        })
      }

      if (!glMap.getLayer('mapillary_point')) {
        glMap.addLayer({
          id: 'mapillary_point',
          source: 'mapillary_point',
          type: 'circle',
          paint: {
            'circle-radius': 5,
            'circle-color': 'rgb(255, 0, 0)',
          },
        })
      }
    } else if (!position) {
      glMap.removeLayer('mapillary_point')
    }
  }

  getPointData = (position: LatLngLiteral) => {
    return {
      type: 'Point',
      coordinates: [position.lng, position.lat],
    }
  }
}

export default withLeaflet(MapillaryLayer)
