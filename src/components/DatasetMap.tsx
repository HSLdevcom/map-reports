import * as React from 'react'
import { createPortal } from 'react-dom'
import { query } from '../helpers/Query'
import gql from 'graphql-tag'
import Map from './Map'
import { observer } from 'mobx-react'
import { get, intersection, clone } from 'lodash'
import styled from 'styled-components'
import { FeatureGroup, marker } from 'leaflet'
import { GeoJSON, Popup } from 'react-leaflet/es'
import MarkerIcon, { MarkerIconStyle } from './MarkerIcon'
import { DatasetView } from '../../shared/types/DatasetView'
import { AnyFunction } from '../../shared/types/AnyFunction'
import MarkerClusterGroup from './MarkerClusterGroup'
import middleOfLine from '../helpers/middleOfLine'
import * as L from 'leaflet'
import { Inspection } from '../../shared/types/Inspection'
import CreateReport from './CreateReport'
import { action, observable } from 'mobx'
import { Location } from '../../shared/types/Location'

const MapArea = styled.div`
  height: calc(100vh - 3rem);
`

const datasetQuery = gql`
  query datasetData($id: ID!) {
    inspection(inspectionId: $id) {
      id
      name
      geoJSON
      entityIdentifier
    }
  }
`

const reportItemsQuery = gql`
  query reportedItems {
    reportItems {
      id
      entityIdentifier
      data
    }
  }
`

interface Props extends DatasetView {
  mutate?: AnyFunction
  queryData?: { inspection: Inspection }
  loading?: boolean
  useVectorLayers?: boolean
}

interface SelectedFeature {
  position: Location
  feature: any
  element: HTMLElement
  layer: any
}

@query({ query: reportItemsQuery })
@query({ query: datasetQuery, getVariables: ({ datasetId }) => ({ id: datasetId }) })
@observer
class DatasetMap extends React.Component<Props, any> {
  @observable
  selectedFeature: SelectedFeature = null

  getUnreportedFeatures = geoJson => {
    const { queryData } = this.props

    const reportItems = get(queryData, 'reportItems', []).map(i => ({
      ...i,
      data: JSON.parse(i.data),
    }))

    const identifiers = reportItems.map(i => i.entityIdentifier)

    const unreportedFeatures = geoJson.features.reduce((unreported, feature) => {
      const keys = Object.keys(get(feature, 'properties', {}))

      // If there is no identifying data, let it through.
      if (keys.length === 0) {
        unreported.push(feature)
        return unreported
      }

      const identifyingKeys = intersection(identifiers, keys)

      // If the data doesn't include an identifying key, let it through.
      if (identifyingKeys.length === 0) {
        unreported.push(feature)
        return unreported
      }

      const entityIdentifier = identifyingKeys[0]
      const identifyingValue = get(feature, `properties.${entityIdentifier}`)

      const reportedItem = reportItems.find(i => {
        const properties = get(i, 'data.properties', get(i, 'data', {}))
        return get(properties, entityIdentifier) === identifyingValue
      })

      if (!reportedItem) {
        unreported.push(feature)
      }

      return unreported
    }, [])

    return unreportedFeatures
  }

  pointToLayer = (_, latlng) => {
    return marker(latlng, {
      icon: MarkerIcon({ type: 'general' }),
    })
  }

  featureToLayer = (feature, layer) => {
    const type = get(feature, 'geometry.type', 'MultiLineString')

    let coordinates =
      type === 'LineString' || type === 'Point'
        ? get(feature, 'geometry.coordinates', [])
        : get(feature, 'geometry.coordinates[0]', [])

    if (type !== 'Point') {
      coordinates = middleOfLine(coordinates)
    }

    const lat = coordinates[1]
    const lon = coordinates[0]

    this.bindPopup(lat, lon, feature, layer)
  }

  bindPopup = (lat, lon, feature, layer) => {
    const popupContent = document.createElement('div')
    layer.bindPopup(L.popup({ minWidth: 250 }).setContent(popupContent))

    layer.on('popupopen', this.showPopup({ lat, lon }, feature, popupContent, layer))
    layer.on('popupclose ', this.closePopup)
  }

  showPopup = (position: Location, feature: any, element: HTMLElement, layer) =>
    action(() => {
      this.selectedFeature = {
        position,
        feature,
        element,
        layer,
      }
    })

  @action
  closePopup = () => {
    this.selectedFeature = null
  }

  render() {
    const { queryData, loading, useVectorLayers = true, datasetName } = this.props
    let geoJson = get(queryData, 'inspection.geoJSON', null)

    if (!geoJson || loading) {
      return 'Loading...'
    }

    const { selectedFeature } = this

    geoJson = JSON.parse(geoJson)
    const unreportedFeatures = this.getUnreportedFeatures(geoJson)
    geoJson = { ...geoJson, features: unreportedFeatures }

    return (
      <MapArea>
        <MarkerIconStyle />
        <Map useVectorLayers={useVectorLayers}>
          <MarkerClusterGroup>
            <GeoJSON
              data={geoJson}
              onEachFeature={this.featureToLayer}
              pointToLayer={this.pointToLayer}
            />
          </MarkerClusterGroup>
        </Map>
        {selectedFeature &&
          createPortal(
            <CreateReport
              title={`${datasetName || 'Unknown'} dataset report`}
              onSubmitted={() => selectedFeature && selectedFeature.layer.closePopup()}
              reportSubject={{
                data: JSON.stringify(selectedFeature.feature),
                type: 'general',
                entityIdentifier: get(
                  queryData,
                  'inspection.entityIdentifier',
                  'unknown'
                ),
              }}
              location={selectedFeature.position}
            />,
            selectedFeature.element
          )}
      </MapArea>
    )
  }
}

export default DatasetMap
