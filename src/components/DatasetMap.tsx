import * as React from 'react'
import { createPortal } from 'react-dom'
import { query } from '../helpers/Query'
import gql from 'graphql-tag'
import Map from './Map'
import { observer } from 'mobx-react'
import { get } from 'lodash'
import styled from 'styled-components'
import { marker } from 'leaflet'
import { GeoJSON, Popup } from 'react-leaflet/es'
import MarkerIcon from './MarkerIcon'
import { DatasetView } from '../../shared/types/DatasetView'
import { AnyFunction } from '../../shared/types/AnyFunction'
import MarkerClusterGroup from './MarkerClusterGroup'
import middleOfLine from '../helpers/middleOfLine'
import * as L from 'leaflet'
import { Inspection } from '../../shared/types/Inspection'
import CreateReport from './CreateReport'
import { action, observable } from 'mobx'

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

interface Props extends DatasetView {
  mutate?: AnyFunction
  queryData?: { inspection: Inspection }
  loading?: boolean
  useVectorLayers?: boolean
}

@query({ query: datasetQuery, getVariables: ({ datasetId }) => ({ id: datasetId }) })
@observer
class DatasetMap extends React.Component<Props, any> {
  @observable
  selectedFeature = null

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

    this.bindPopup(lat, lon, feature.properties, layer)
  }

  bindPopup = (lat, lon, properties, layer) => {
    const popupContent = document.createElement('div')
    layer.bindPopup(L.popup({ minWidth: 250 }).setContent(popupContent))

    layer.on('popupopen', this.showPopup({ lat, lon, properties }, popupContent))
    layer.on('popupclose ', this.closePopup)
  }

  showPopup = (data, element) =>
    action(() => {
      this.selectedFeature = {
        data,
        element,
      }
    })

  @action
  closePopup = () => {
    this.selectedFeature = null
  }

  render() {
    const { queryData, loading, useVectorLayers = true } = this.props
    let geoJson = get(queryData, 'inspection.geoJSON', null)

    if (!geoJson || loading) {
      return 'Loading...'
    }

    const { selectedFeature } = this

    // TODO: Add submit report form to popup

    geoJson = JSON.parse(geoJson)

    return (
      <MapArea>
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
              reportSubject={{
                data: JSON.stringify(selectedFeature.data.properties),
                type: 'general',
                entityIdentifier: get(
                  queryData,
                  'inspection.entityIdentifier',
                  'unknown'
                ),
              }}
              location={{ lat: selectedFeature.data.lat, lon: selectedFeature.data.lon }}
            />,
            selectedFeature.element
          )}
      </MapArea>
    )
  }
}

export default DatasetMap
