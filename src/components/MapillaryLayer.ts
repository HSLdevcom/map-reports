import { withLeaflet, MapLayer, GridLayer } from 'react-leaflet/es'
import mapboxLeaflet from '../helpers/MapboxGlLeaflet'
import { closestPointInGeometry } from '../helpers/closestPoint'
import { LatLng } from 'leaflet'

class MapillaryLayer extends MapLayer {
  gl

  createLeafletElement() {
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
    })
  }

  onHover = (leafletMap, glMap) => e => {
    const { containerPoint, latlng } = e

    const bbox = [
      { x: containerPoint.x - 20, y: containerPoint.y - 20 },
      { x: containerPoint.x + 20, y: containerPoint.y + 20 },
    ]

    const features = glMap.queryRenderedFeatures(bbox, {
      layers: ['mapillary'],
    })

    if (features.length !== 0) {
      let hoveredFeature = null

      let featurePoint = features.slice(0, 20).reduce((closestFeaturePoint, feature) => {
        const jsonFeature = feature.toJSON()
        const pointCandidate = closestPointInGeometry(latlng, jsonFeature.geometry)

        if (
          !closestFeaturePoint ||
          (!!pointCandidate &&
            latlng.distanceTo(pointCandidate) < latlng.distanceTo(closestFeaturePoint))
        ) {
          hoveredFeature = jsonFeature
          return pointCandidate
        }

        return closestFeaturePoint
      }, false)

      featurePoint = featurePoint && !featurePoint.equals(latlng) ? featurePoint : false
      this.highlightMapillaryPoint(glMap, featurePoint)
    }
  }

  highlightMapillaryPoint = (glMap, position) => {
    if (!position) {
      glMap.removeLayer('mapillary_point')
      return
    }

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
  }

  getPointData = position => {
    return {
      type: 'Point',
      coordinates: [position.lng, position.lat],
    }
  }
}

export default withLeaflet(MapillaryLayer)