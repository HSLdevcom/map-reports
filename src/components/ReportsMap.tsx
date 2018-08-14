import * as React from 'react'
import Map from './Map'
import { RendersReports } from '../../types/RendersReports'
import { inject, observer } from 'mobx-react'
import { MapModes } from '../stores/MapStore'
import { app } from 'mobx-app'
import { get } from 'lodash'
import { Marker, MarkerState } from '../../types/Marker'
import { ReportActions } from '../../types/ReportActions'
import { LatLng, latLng, marker } from 'leaflet'
import GeoJSON from 'react-leaflet/es/GeoJSON'
import MarkerIcon from './MarkerIcon'

interface Props extends RendersReports {
  state?: any
  Report?: ReportActions
  Map?: any
  useBounds?: boolean
  useVectorLayers?: boolean
}

@inject(app('Report'))
@observer
class ReportsMap extends React.Component<Props, any> {
  state = {
    renderGeoJson: [],
  }

  renderGeoJson = (geoJson = []) => {
    this.setState({
      renderGeoJson: geoJson,
    })
  }

  render() {
    const { reports = [], state, Report, useBounds, useVectorLayers = false } = this.props

    const markers: Marker[] = reports
      .filter(report => !!get(report, 'item.lat', 0))
      // @ts-ignore
      .map(({ item: { lat, lon, type, recommendedMapZoom = 16 }, message, id }) => {
        const isInactive =
          (state.focusedReport !== null && state.focusedReport !== id) ||
          state.mapMode === MapModes.pick

        const markerPosition: LatLng = latLng(lat, lon)

        return {
          state:
            state.focusedReport === id && state.mapMode !== MapModes.pick
              ? MarkerState.focus
              : isInactive
                ? MarkerState.inactive
                : MarkerState.default,
          id,
          zoom: recommendedMapZoom,
          type,
          position: markerPosition,
          message,
          onClick: () => Report.focusReport(id),
        }
      })

    if (state.mapMode === MapModes.pick && state.lastClickedLocation !== null) {
      markers.push({
        type: 'new-report',
        state: MarkerState.focus,
        id: 'clicked_location',
        zoom: 16,
        position: latLng(state.lastClickedLocation.lat, state.lastClickedLocation.lon),
        message: 'Create new issue here.',
      })
    }

    // TODO: Figure out the geojson and the querying.

    return (
      <Map
        useVectorLayers={useVectorLayers}
        useBounds={useBounds}
        focusedMarker={state.focusedReport}
        onMapClick={({ layerPoint: point }, glMap) => {
          const width = 30
          const height = 30

          if (glMap) {
            this.renderGeoJson(
              glMap._glMap.queryRenderedFeatures([
                [point.x - width / 2, point.y - height / 2],
                [point.x + width / 2, point.y + height / 2],
              ])
            )
          }

          Report.focusReport(null)
        }}
        markers={markers}>
        {this.state.renderGeoJson.length > 0 && (
          <GeoJSON
            pointToLayer={(props, latlng) =>
              marker(latlng, {
                icon: MarkerIcon({ type: 'general' }),
              })
            }
            key={this.state.renderGeoJson.length + 'geojson' + Math.random()}
            data={{
              type: 'FeatureCollection',
              features: this.state.renderGeoJson,
            }}
            style={() => ({ color: '#ff0000' })}
          />
        )}
      </Map>
    )
  }
}

export default ReportsMap
