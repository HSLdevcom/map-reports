import * as React from 'react'
import styled from 'styled-components'
import CreateManualReport from '../components/CreateManualReport'
import ReportsMap from '../components/ReportsMap'
import { get } from 'lodash'
import { inject, observer } from 'mobx-react'
import { app } from 'mobx-app'
import { Popup, GeoJSON, Circle } from 'react-leaflet/es'
import { ReportActions } from '../../shared/types/ReportActions'
import { circle, latLngBounds } from 'leaflet'
import SelectFeatureTable from '../components/SelectFeatureTable'
import { observable, action } from 'mobx'
import { ReportSubject } from '../../shared/types/ReportSubject'
import osmtogeojson from 'osmtogeojson'

const CreateReportView = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: 25rem 1fr;
`

const Sidebar = styled.div`
  height: calc(100vh - 3rem);
  overflow: auto;
  display: flex;
  flex-direction: column;
`

const FeaturesWrapper = styled.div`
  padding: 1rem;
`

const MapArea = styled.div`
  height: 100%;
`

interface Props {
  Report?: ReportActions
  Map?: any
  state?: any
}

@inject(app('Report', 'Map'))
@observer
class CreateReportPage extends React.Component<Props, any> {
  @observable
  availableFeatures = []

  @observable
  highlightGeoJson = null

  @observable
  reportSubject: ReportSubject = {
    entityIdentifier: 'unknown',
    type: 'general',
    data: '{}',
  }

  @action
  onMapClick = (event, zoom, queriedFeatures = []) => {
    const { Report } = this.props
    Report.focusReport(null)
    this.availableFeatures = queriedFeatures
  }

  onFeatureHover = (feature = null) =>
    action(() => {
      if (!feature) {
        this.highlightGeoJson = null
      } else {
        const featureGeoJson = osmtogeojson({ elements: [feature] })
        this.highlightGeoJson = featureGeoJson
      }
    })

  useAsEntity = (identifier, type, feature) =>
    action((e: React.PointerEvent<any>) => {
      e.preventDefault()
      const { Map } = this.props

      this.reportSubject.entityIdentifier = identifier
      this.reportSubject.type = type
      this.reportSubject.data = JSON.stringify(feature)

      let centerLatLng: { lat: number; lon: number } | boolean = false

      if (get(feature, 'lat', 0)) {
        // Set marker to point coordinates.
        centerLatLng = {
          lat: feature.lat,
          lon: feature.lon,
        }
      } else if (get(feature, 'bounds', null)) {
        const { minlat, minlon, maxlat, maxlon } = feature.bounds
        const bounds = latLngBounds([minlat, minlon], [maxlat, maxlon])
        const center = bounds.getCenter()

        centerLatLng = {
          lat: center.lat,
          lon: center.lng,
        }
      }

      if (centerLatLng) {
        Map.setClickedLocation(centerLatLng)
      }
    })

  render() {
    const { availableFeatures = [], highlightGeoJson } = this

    return (
      <CreateReportView>
        <Sidebar>
          <CreateManualReport reportSubject={this.reportSubject} />
          {availableFeatures.length !== 0 && (
            <FeaturesWrapper>
              <SelectFeatureTable
                onHover={this.onFeatureHover}
                onSelect={this.useAsEntity}
                features={availableFeatures.map(feature => {
                  return {
                    name: feature.id,
                    entityIdentifier: 'id',
                    feature,
                  }
                })}
              />
            </FeaturesWrapper>
          )}
        </Sidebar>
        <MapArea>
          <ReportsMap
            useBounds={false}
            useVectorLayers
            onMapClick={this.onMapClick}
            highlightGeoJson={highlightGeoJson}
          />
        </MapArea>
      </CreateReportView>
    )
  }
}

export default CreateReportPage
