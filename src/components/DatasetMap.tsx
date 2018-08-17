import * as React from 'react'
import { query } from '../helpers/Query'
import gql from 'graphql-tag'
import Map from './Map'
import { observer } from 'mobx-react'
import { get } from 'lodash'
import styled from 'styled-components'
import { ReportFragment } from '../fragments/ReportFragment'
import { mutate } from '../helpers/Mutation'
import { marker } from 'leaflet'
import { GeoJSON, Popup } from 'react-leaflet/es'
import MarkerIcon from './MarkerIcon'
import { DatasetView } from '../../types/DatasetView'
import { AnyFunction } from '../../types/AnyFunction'
import { Reporter } from '../../types/Reporter'
import MarkerClusterGroup from './MarkerClusterGroup'
import middleOfLine from '../helpers/middleOfLine'
import * as L from 'leaflet'

const MapArea = styled.div`
  height: calc(100vh - 3rem);
`

const datasetQuery = gql`
  query datasetData($id: ID!) {
    inspection(inspectionId: $id) {
      id
      name
      geoJSON
    }
  }
`

const createReportMutation = gql`
  mutation createStopReport($reportData: InputReport!, $reportItem: InputReportItem!) {
    createReport(reportData: $reportData, reportItem: $reportItem) {
      ...ReportFields
    }
  }
  ${ReportFragment}
`

interface Props extends DatasetView {
  mutate?: AnyFunction
  queryData?: { reporter: Reporter }
  loading?: boolean
}

@query({ query: datasetQuery, getVariables: ({ datasetId }) => ({ id: datasetId }) })
@mutate({ mutation: createReportMutation })
@observer
class DatasetMap extends React.Component<Props, any> {
  componentDidMount() {
    // Attach the create issue handler to a global so that the inline js can call it.
    // @ts-ignore
    window.__handleClick = this.onCreateIssue
  }

  onCreateIssue = async (lat, lon) => {
    const { mutate } = this.props

    await mutate({
      variables: {
        reportData: {
          title: `Report from dataset`,
          message: `Click and find out :)`,
        },
        reportItem: {
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          entityIdentifier: 'unknown',
          recommendedMapZoom: 18,
          type: 'general',
        },
      },
    })
  }

  pointToLayer = ({ properties }, latlng) => {
    const lat = latlng.lat
    const lon = latlng.lng

    const pointMarker = marker(latlng, {
      icon: MarkerIcon({ type: 'general' }),
    })

    return pointMarker
  }

  featureToLayer = (feature, layer) => {
    const type = get(feature, 'geometry.type', 'MultiLineString')
    let point

    if (type !== 'Point') {
      let line

      if (type === 'LineString') {
        line = get(feature, 'geometry.coordinates')
      }

      if (type === 'MultiLineString') {
        line = get(feature, 'geometry.coordinates[0]')
      }

      point = middleOfLine(line)
    } else {
      point = get(feature, 'geometry.coordinates')
    }

    const lat = point[1]
    const lon = point[0]

    this.showPopup(lat, lon, layer)
  }

  showPopup = (lat, lon, layer) => {
    const popupContent = `
      <div>
        <p>
          <button onclick="__handleClick('${lat}', '${lon}')">
            Create report
          </button>
        </p>
      </div>
    `
    layer.bindPopup(L.popup({ minWidth: 250 }).setContent(popupContent))
  }

  render() {
    const { queryData, loading } = this.props

    let geoJson = get(queryData, 'inspection.geoJSON', null)

    if (!geoJson || loading) {
      return 'Loading...'
    }

    geoJson = JSON.parse(geoJson)
    console.log(geoJson)

    return (
      <MapArea>
        <Map useVectorLayers>
          <MarkerClusterGroup>
            <GeoJSON
              data={geoJson}
              onEachFeature={this.featureToLayer}
              pointToLayer={this.pointToLayer}>
              <Popup>hey</Popup>
            </GeoJSON>
          </MarkerClusterGroup>
        </Map>
      </MapArea>
    )
  }
}

export default DatasetMap
