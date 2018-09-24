import * as React from 'react'
import {
  Map as LeafletMap,
  TileLayer,
  Marker as LeafletMarker,
  Popup,
  LayersControl,
  ZoomControl,
  GeoJSON,
} from 'react-leaflet'
import { observer, inject } from 'mobx-react'
import MarkerIcon, { MarkerIconStyle } from './MarkerIcon'
import { app } from 'mobx-app'
import {
  LatLng,
  latLng,
  LatLngExpression,
  LeafletMouseEvent,
  latLngBounds,
  circle,
} from 'leaflet'
import { Location } from '../../shared/types/Location'
import { MarkerState, Marker } from '../../shared/types/Marker'
import 'leaflet/dist/leaflet.css'
import { AnyFunction } from '../../shared/types/AnyFunction'
import styled from 'styled-components'
import MarkerClusterGroup from './MarkerClusterGroup'
import MapboxGlLayer from './MapboxGlLayer'
import get from 'lodash/get'

const attribution = `Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,
<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,
Imagery © <a href="http://mapbox.com">Mapbox</a>`

const url =
  'https://digitransit-dev-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}{retina}.png'

interface Props {
  useBounds?: boolean
  markers?: Marker[]
  onMapClick?: AnyFunction
  focusedMarker?: string
  geoJSON?: any
  pointToLayer?: AnyFunction
  onEachFeature?: AnyFunction
  useVectorLayers?: boolean
  children?: any
  highlightGeoJson?: any
  Map?: {
    setClickedLocation: (location: Location) => void
    setMapLocation: (location: LatLngExpression) => void
    setMapZoom: (zoom: number) => void
  }
}

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;

  > .leaflet-container {
    width: 100%;
    height: 100%;
    z-index: 0;
  }
`

const CenterButton = styled.button`
  position: absolute;
  bottom: 0;
  right: 0;
  width: auto;
  height: auto;
  z-index: 100;
`

const defaultMapLocation: LatLng = latLng(60.1689784, 24.9230033)
const defaultMapZoom = 13

function calculateMarkerBounds(markers) {
  let latMin = defaultMapLocation.lat
  let lngMin = defaultMapLocation.lng
  let latMax = latMin
  let lngMax = lngMin

  markers.forEach(marker => {
    latMin = Math.min(latMin, marker.position.lat)
    lngMin = Math.min(lngMin, marker.position.lng)
    latMax = Math.max(latMax, marker.position.lat)
    lngMax = Math.max(lngMax, marker.position.lng)
  })

  return latLngBounds([[latMin, lngMin], [latMax, lngMax]])
}

@inject(app('Map'))
@observer
class Map extends React.Component<Props, any> {
  static getDerivedStateFromProps({ useBounds, markers }) {
    if (useBounds && markers && markers.length > 0) {
      const bounds = calculateMarkerBounds(markers)

      return {
        bounds,
      }
    }

    return {
      bounds: null,
    }
  }

  glRef = React.createRef()

  state = {
    center: defaultMapLocation,
    zoom: defaultMapZoom,
    bounds: null,
  }

  componentDidUpdate({ focusedMarker: prevFocusedMarker }: Props) {
    const { focusedMarker, markers } = this.props

    if (
      focusedMarker &&
      focusedMarker !== prevFocusedMarker &&
      markers &&
      markers.length > 0
    ) {
      this.getFocusedPosition()
    }

    // TODO: Add mapillary layer

    /*if (this.glRef.current) {
      const mapillarySource = {
        type: 'vector',
        tiles: ['https://d25uarhxywzl1j.cloudfront.net/v0.1/{z}/{x}/{y}.mvt'],
        minzoom: 0,
        maxzoom: 14,
      }

      const map = this.glRef.current.leafletElement._glMap

      map.addSource('mapillary', mapillarySource)
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
          'line-color': 'rgb(255, 0, 0)',
          'line-width': 2,
        },
      })
    }*/
  }

  // Get the position for the currently focused marker or return
  // the default center and zoom values if no marker is focused.
  getFocusedPosition = () => {
    const { focusedMarker, markers } = this.props
    const marker = markers.find(marker => marker.id === focusedMarker)

    if (!marker) {
      return
    }

    const { zoom: markerZoom = 16, position } = marker

    this.setState({
      center: position,
      zoom: markerZoom || 16,
    })
  }

  onMapClick = (event: LeafletMouseEvent) => {
    const { useVectorLayers, Map: MapStore, onMapClick = () => {} } = this.props
    const { lat, lng } = event.latlng

    MapStore.setClickedLocation({ lat, lon: lng })

    if (useVectorLayers && this.glRef.current) {
      onMapClick(event, this.state.zoom, get(this, 'glRef.current.leafletElement', null))
    } else {
      onMapClick(event, this.state.zoom)
    }
  }

  centerOnHelsinki = e => {
    e.preventDefault()

    this.setState({
      center: defaultMapLocation,
      zoom: defaultMapZoom,
    })
  }

  trackViewport = ({ center: viewportCenter, zoom: viewportZoom }) => {
    if (!viewportCenter) {
      return
    }

    const centerLatLng = latLng(viewportCenter[0], viewportCenter[1])

    this.setState({
      center: centerLatLng,
      zoom: viewportZoom,
    })
  }

  render() {
    const {
      markers = [],
      children,
      useBounds,
      useVectorLayers,
      highlightGeoJson,
    } = this.props
    const { center, zoom, bounds } = this.state

    return (
      <MapContainer>
        <MarkerIconStyle />
        <LeafletMap
          center={center}
          zoom={zoom}
          onViewportChange={this.trackViewport}
          bounds={useBounds ? bounds : undefined}
          onClick={this.onMapClick}
          touchZoom={true}
          minZoom={10}
          maxZoom={18}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer name="Raster" checked={!useVectorLayers}>
              <TileLayer
                zoomOffset={-1}
                tileSize={512}
                attribution={attribution}
                retina="@2x"
                url={url}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Vector" checked={useVectorLayers}>
              <MapboxGlLayer ref={this.glRef} />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer name="Aerial">
              <TileLayer
                attribution="MML/LUKE"
                url="http://tiles.kartat.kapsi.fi/ortokuva/{z}/{x}/{y}.jpg"
              />
            </LayersControl.BaseLayer>
          </LayersControl>
          <ZoomControl position="topright" />
          {markers.length > 0 && (
            <MarkerClusterGroup>
              {markers.map(
                ({ type, position, message, id, state: markerState, onClick }) => (
                  <LeafletMarker
                    onClick={onClick}
                    key={`marker_${id}`}
                    position={position}
                    icon={MarkerIcon({
                      type,
                      focused: markerState === MarkerState.focus,
                    })}>
                    <Popup autoPan={false}>{message}</Popup>
                  </LeafletMarker>
                )
              )}
            </MarkerClusterGroup>
          )}
          {highlightGeoJson && (
            <GeoJSON
              data={highlightGeoJson}
              style={() => ({ color: '#00ff99' })}
              pointToLayer={(feature, latlng) =>
                circle(latlng, {
                  radius: 4,
                  weight: 0,
                  fillColor: '#00ff00',
                  fillOpacity: 1,
                })
              }
            />
          )}
          {children}
        </LeafletMap>
        <CenterButton onClick={this.centerOnHelsinki}>Center on Helsinki</CenterButton>
      </MapContainer>
    )
  }
}

export default Map
