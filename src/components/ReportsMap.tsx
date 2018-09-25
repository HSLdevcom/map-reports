import * as React from 'react'
import Map from './Map'
import { RendersReports } from '../../shared/types/RendersReports'
import { inject, observer } from 'mobx-react'
import { MapModes } from '../stores/MapStore'
import { app } from 'mobx-app'
import { get } from 'lodash'
import { Marker, MarkerState } from '../../shared/types/Marker'
import { ReportActions } from '../../shared/types/ReportActions'
import { LatLng, latLng, LeafletMouseEvent } from 'leaflet'
import { AnyFunction } from '../../shared/types/AnyFunction'
import { overpassQuery } from '../helpers/overpassQuery'

interface Props extends RendersReports {
  state?: any
  Report?: ReportActions
  Map?: any
  useBounds?: boolean
  useVectorLayers?: boolean
  onMapClick?: AnyFunction
  highlightGeoJson?: any
}

@inject(app('Report'))
@observer
class ReportsMap extends React.Component<Props, any> {
  onMapClick = async (event: LeafletMouseEvent, zoom) => {
    const { onMapClick } = this.props
    const {
      latlng: { lat, lng },
    } = event

    if (zoom > 12) {
      const renderedFeatures = await overpassQuery(lat, lng)
      onMapClick(event, zoom, renderedFeatures)
    } else {
      onMapClick(event, zoom, [])
    }
  }

  getReportMarkers = (): Marker[] => {
    const { state, reports = [], Report } = this.props

    return (
      reports
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
    )
  }

  render() {
    const { state, useBounds, children, highlightGeoJson } = this.props

    const markers: Marker[] = this.getReportMarkers()

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

    return (
      <Map
        highlightGeoJson={highlightGeoJson}
        useBounds={useBounds}
        focusedMarker={state.focusedReport}
        onMapClick={this.onMapClick}
        markers={markers}>
        {children}
      </Map>
    )
  }
}

export default ReportsMap
