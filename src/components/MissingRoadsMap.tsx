import * as React from 'react'
import { compose } from 'react-apollo'
import { query } from '../helpers/Query'
import gql from 'graphql-tag'
import Map from './Map'
import { inject, observer } from 'mobx-react'
import { get } from 'lodash'
import styled, { injectGlobal } from 'styled-components'
import { ReportFragment } from '../fragments/ReportFragment'
import { mutate } from '../helpers/Mutation'
import * as prettyJson from 'prettyjson'
import * as L from 'leaflet'
import { GeoJSON } from 'react-leaflet/es'
import middleOfLine from '../helpers/middleOfLine'
import { DatasetView } from '../../types/DatasetView'
import { AnyFunction } from '../../types/AnyFunction'
import { Inspection } from '../../types/Inspection'

const MapArea = styled.div`
  height: calc(100vh - 3rem);
`

injectGlobal`
  .feature-props {
    white-space: pre-line;
  }
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

const enhance = compose(
  query({ query: datasetQuery, getVariables: ({ datasetId }) => ({ id: datasetId }) }),
  mutate({ mutation: createReportMutation }),
  observer
)

interface Props extends DatasetView {
  mutate?: AnyFunction
  queryData?: { inspection: Inspection }
  loading?: boolean
}

class MissingRoadsMap extends React.Component<Props, any> {
  componentDidMount() {
    // Attach the create issue handler to a global so that the inline js can call it.
    // @ts-ignore
    window.__handleMissingRoadClick = this.onCreateIssue
  }

  onCreateIssue = async (lat, lon, feature) => {
    const { mutate, queryData } = this.props
    const reporterId = get(queryData, 'reporter.id', null)
    const featureJson = window.atob(feature)

    await mutate({
      variables: {
        reportData: {
          title: `Missing road`,
          message: `There should be a road here.`,
          reporter: reporterId,
        },
        reportItem: {
          lat: parseFloat(lat),
          lon: parseFloat(lon),
          data: featureJson,
          entityIdentifier: get(featureJson, 'LINK_ID', 'no-identifier'),
          recommendedMapZoom: 16,
          type: 'road',
        },
      },
    })
  }

  featureToLayer = (feature, layer) => {
    const type = get(feature, 'geometry.type', 'MultiLineString')
    let line

    if (type === 'LineString') {
      line = get(feature, 'geometry.coordinates')
    }

    if (type === 'MultiLineString') {
      line = get(feature, 'geometry.coordinates[0]')
    }

    const lineMiddle = middleOfLine(line)

    const lat = lineMiddle[1]
    const lon = lineMiddle[0]
    // Stringify feature and base64 encode it to make it work inline
    const featureJson = window.btoa(JSON.stringify(feature))

    /**
     * The geojson layer does not support React-leaflets React components, so we
     * have to do this with plain HTML. __handleMissingRoadClick is a global
     * that points to onCreateIssue() in this component. Make sure to feed
     * it only strings, as numbers may get converted to characters.
     */

    const popupContent = `
      <div>
        <pre class="feature-props"><code>
          ${prettyJson.render(feature.properties)}
        </code></pre>
        <p>
          <button onclick="__handleMissingRoadClick('${lat}', '${lon}', '${featureJson}')">
            Create report
          </button>
        </p>
      </div>
    `
    layer.bindPopup(L.popup({ minWidth: 250 }).setContent(popupContent))
  }

  render() {
    const { queryData, loading } = this.props

    const missingRoadsDataset = get(queryData, 'reporter', null)

    if (!missingRoadsDataset || loading) {
      return 'Loading...'
    }

    return (
      <MapArea>
        <Map>
          <GeoJSON
            data={JSON.parse(missingRoadsDataset.geoJSON)}
            onEachFeature={this.featureToLayer}
          />
        </Map>
      </MapArea>
    )
  }
}

export default enhance(MissingRoadsMap)
