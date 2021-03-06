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
  LatLngBounds,
} from 'leaflet'
import { Location } from '../../shared/types/Location'
import { MarkerState, Marker } from '../../shared/types/Marker'
import 'leaflet/dist/leaflet.css'
import { AnyFunction } from '../../shared/types/AnyFunction'
import styled from 'styled-components'
import MarkerClusterGroup from './MarkerClusterGroup'
import MapboxGlLayer from './MapboxGlLayer'
import MapillaryLayer from './MapillaryLayer'
import MapillaryViewer from './MapillaryViewer'

const attribution = `Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors,
<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>,
Imagery © <a href="http://mapbox.com">Mapbox</a>`

const url =
  'https://digitransit-dev-cdn-origin.azureedge.net/map/v1/hsl-map/{z}/{x}/{y}{retina}.png'

export const enum MapLayers {
  RASTER = 'Raster',
  AERIAL = 'Aerial',
  VECTOR = 'Vector',
  MAPILLARY = 'Mapillary',
}

interface Props {
  useBounds?: boolean
  markers?: Marker[]
  onMapClick?: AnyFunction
  focusedMarker?: string
  geoJSON?: any
  pointToLayer?: AnyFunction
  onEachFeature?: AnyFunction
  defaultLayer?: MapLayers
  children?: any
  highlightGeoJson?: any
  Map?: {
    setClickedLocation: (location: Location) => void
    setMapLocation: (location: LatLngExpression) => void
    setMapZoom: (zoom: number) => void
  }
}

interface State {
  center: LatLngExpression
  zoom: number
  bounds?: LatLngBounds
  currentBaseLayer: MapLayers
  currentMapillaryViewerLocation: LatLng | boolean
  currentMapillaryMapLocation: LatLng | boolean
}

const MapContainer = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;

  > .leaflet-container {
    width: 100%;
    z-index: 0;
    flex: 1 1 50%;
  }
`

const MapillaryScreen = styled(MapillaryViewer)`
  width: 100%;
  height: 100%;
  flex: 1 1 50%;
  position: relative;
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
class Map extends React.Component<Props, State> {
  static defaultProps = {
    defaultLayer: MapLayers.VECTOR,
  }

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
    currentBaseLayer: this.props.defaultLayer,
    currentMapillaryViewerLocation: false,
    currentMapillaryMapLocation: false,
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
    const { Map: MapStore, onMapClick = () => {} } = this.props
    const { lat, lng } = event.latlng

    MapStore.setClickedLocation({ lat, lon: lng })
    onMapClick(event, this.state.zoom)
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

  onChangeBaseLayer = ({ name }: { name: MapLayers }) => {
    this.setState({
      currentBaseLayer: name,
    })
  }

  setMapillaryViewerLocation = (location: LatLng) => {
    this.setState({
      currentMapillaryViewerLocation: location,
    })
  }

  onMapillaryNavigation = ({ latLon: { lat, lon } }: { latLon: Location }) => {
    const location = latLng({ lat, lng: lon })

    this.setState({
      currentMapillaryMapLocation: location,
    })
  }

  render() {
    const { markers = [], children, useBounds, highlightGeoJson } = this.props
    const {
      center,
      zoom,
      bounds,
      currentBaseLayer,
      currentMapillaryViewerLocation,
      currentMapillaryMapLocation,
    } = this.state

    return (
      <MapContainer>
        <MarkerIconStyle />
        <LeafletMap
          onBaselayerchange={this.onChangeBaseLayer}
          center={center}
          zoom={zoom}
          onViewportChange={this.trackViewport}
          bounds={useBounds ? bounds : undefined}
          onClick={this.onMapClick}
          touchZoom={true}
          minZoom={10}
          maxZoom={18}>
          <LayersControl position="topright">
            <LayersControl.BaseLayer
              name="Raster"
              checked={currentBaseLayer === 'Raster'}>
              <TileLayer
                zoomOffset={-1}
                tileSize={512}
                attribution={attribution}
                retina="@2x"
                url={url}
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer
              name="Vector"
              checked={currentBaseLayer === 'Vector'}>
              <MapboxGlLayer ref={this.glRef} />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer
              name="Aerial"
              checked={currentBaseLayer === 'Aerial'}>
              <TileLayer
                attribution="MML/LUKE"
                url="http://tiles.kartat.kapsi.fi/ortokuva/{z}/{x}/{y}.jpg"
              />
            </LayersControl.BaseLayer>
            <LayersControl.BaseLayer
              name="Mapillary"
              checked={currentBaseLayer === 'Mapillary'}>
              <MapillaryLayer
                location={currentMapillaryMapLocation}
                layerIsActive={currentBaseLayer === 'Mapillary'}
                onSelectLocation={this.setMapillaryViewerLocation}
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
        {currentBaseLayer === 'Mapillary' &&
          currentMapillaryViewerLocation && (
            <MapillaryScreen
              onNavigation={this.onMapillaryNavigation}
              location={currentMapillaryViewerLocation}
            />
          )}
      </MapContainer>
    )
  }
}

export default Map
