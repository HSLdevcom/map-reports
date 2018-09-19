import * as React from 'react'
import styled from 'styled-components'
import CreateManualReport from '../components/CreateManualReport'
import ReportsMap from '../components/ReportsMap'
import { get } from 'lodash'
import { inject, observer } from 'mobx-react'
import { app } from 'mobx-app'
import { Popup, GeoJSON, Circle } from 'react-leaflet/es'
import { ReportActions } from '../../shared/types/ReportActions'
import { circle } from 'leaflet'
import SelectFeatureTable from '../components/SelectFeatureTable'
import { observable, action } from 'mobx'
import { ReportSubject } from '../../shared/types/ReportSubject'

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

const blacklistedLayers = [
  'bus_route_inner',
  'bus_route_case',
  'road_street_case',
  'tram_route_inner',
  'tram_route_case',
  'building_shadow',
  'road_path_case',
  'road_primary_case',
  'road_secondary_case',
  'Stops case',
  'road_path_steps_case',
]

// For combining props, we need to use a delimiter that should never show up in the values.
const delimiter = '|'
const identifyingProp = [`routeId`, 'stopId', 'name', 'house_num', 'type']

function getIdentifyingPropValue(item, propName) {
  const values = []
  const props = propName.split(delimiter)

  for (const propIndex in props) {
    const prop = props[propIndex]

    if (prop && item[prop]) {
      values.push(item[prop].split('/')[0])
    }
  }

  return values.join(delimiter)
}

function getIdentifyingPropName(properties) {
  const availableProps = Object.keys(properties)

  return identifyingProp.reduce((propName: string, val: string) => {
    if (propName) {
      return propName
    }

    const names = []
    const props = val.split(delimiter)

    for (const propIndex in props) {
      const prop = props[propIndex]

      if (availableProps.includes(prop)) {
        names.push(prop)
      }
    }

    return names.join(delimiter)
  }, '')
}

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

  getFeatureOptions = renderedFeatures => {
    return renderedFeatures.reduce((features, feature) => {
      const layerId = get(feature, 'layer.id')

      if (blacklistedLayers.includes(layerId)) {
        return features
      }

      const identifyingPropName = getIdentifyingPropName(feature.properties)
      const identifyingPropValue = getIdentifyingPropValue(
        feature.properties,
        identifyingPropName
      )

      if (
        identifyingPropName &&
        features.some(
          ft =>
            getIdentifyingPropValue(ft.properties, identifyingPropName) ===
            identifyingPropValue
        )
      ) {
        return features
      }

      features.push(feature)
      return features
    }, [])
  }

  @action
  onMapClick = (event, zoom, renderedFeatures = []) => {
    const { Report } = this.props
    Report.focusReport(null)
    this.availableFeatures = this.getFeatureOptions(renderedFeatures)
  }

  onFeatureHover = (feature = null) => action(() => (this.highlightGeoJson = feature))

  useAsEntity = (identifier, type, feature) =>
    action((e: React.PointerEvent<any>) => {
      e.preventDefault()
      const { Map } = this.props

      this.reportSubject.entityIdentifier = identifier
      this.reportSubject.type = type
      this.reportSubject.data = JSON.stringify(get(feature, 'properties', {}))

      if (get(feature, 'geometry.type', '') === 'Point') {
        // Set marker to point coordinates. Geojson uses lon/lat, not the other way around.
        Map.setClickedLocation({
          lat: feature.geometry.coordinates[1],
          lon: feature.geometry.coordinates[0],
        })
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
                  const propName = getIdentifyingPropName(feature.properties)
                  const entityIdentifier =
                    getIdentifyingPropValue(feature.properties, propName) || 'unknown'

                  return {
                    name: feature.layer.id,
                    identifierPropName: propName,
                    identifierPropValue: entityIdentifier,
                    feature,
                  }
                })}
              />
            </FeaturesWrapper>
          )}
        </Sidebar>
        <MapArea>
          <ReportsMap useBounds={false} useVectorLayers onMapClick={this.onMapClick}>
            {highlightGeoJson && (
              <GeoJSON
                data={highlightGeoJson}
                style={() => ({ color: '#00ff99' })}
                pointToLayer={(feature, latlng) =>
                  circle(latlng, {
                    radius: 8,
                    color: '#00ff99',
                    fillColor: '#00ff00',
                    fillOpacity: 0.5,
                  })
                }
              />
            )}
          </ReportsMap>
        </MapArea>
      </CreateReportView>
    )
  }
}

export default CreateReportPage
