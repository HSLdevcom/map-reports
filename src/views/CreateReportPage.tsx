import * as React from 'react'
import styled from 'styled-components'
import SubmitReport from '../components/SubmitReport'
import ReportsMap from '../components/ReportsMap'
import { get, intersection } from 'lodash'
import { inject, observer } from 'mobx-react'
import { app } from 'mobx-app'
import { InsHTMLAttributes } from 'react'
import { Popup } from 'react-leaflet/es'
import { ReportActions } from '../../types/ReportActions'

const CreateReportView = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: 25rem 1fr;
`

const Sidebar = styled.div`
  height: calc(100vh - 3rem);
  overflow: auto;
  display: flex;
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
const delimiter = '/'
const identifyingProp = [
  `routeId${delimiter}direction`,
  'routeId',
  'stopId',
  'name',
  'house_num',
  'type',
]

function getIdentifyingPropValue(item, propName) {
  const values = []
  const props = propName.split(delimiter)

  for (const propIndex in props) {
    const prop = props[propIndex]

    if (prop) {
      values.push(item[prop])
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
  state?: any
}

@inject(app('Report'))
@observer
class CreateReportPage extends React.Component<Props, any> {
  state = {
    availableFeatures: [],
    popupPosition: null,
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

      console.log(identifyingPropName, identifyingPropValue)

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

  onMapClick = (event, zoom, renderedFeatures = []) => {
    const { Report } = this.props
    Report.focusReport(null)

    const availableFeatures = this.getFeatureOptions(renderedFeatures)

    this.setState({
      availableFeatures,
      popupPosition: event.latlng,
    })
  }

  useAsEntity = (identifier, type, data) => e => {
    e.preventDefault()

    const { Report } = this.props
    Report.setDraftEntity(identifier, type)
    Report.setDraftData(data)
  }

  render() {
    const { availableFeatures = [], popupPosition } = this.state

    return (
      <CreateReportView>
        <Sidebar>
          <SubmitReport />
        </Sidebar>
        <MapArea>
          <ReportsMap useBounds={false} useVectorLayers onMapClick={this.onMapClick}>
            {availableFeatures.length > 0 &&
              popupPosition && (
                <Popup
                  minWidth={300}
                  key={JSON.stringify(popupPosition)}
                  autoClose={false}
                  closeOnClick={false}
                  position={popupPosition}>
                  <table>
                    <thead>
                      <tr>
                        <td>Feature</td>
                        <td>ID</td>
                        <td>Select</td>
                      </tr>
                    </thead>
                    <tbody>
                      {availableFeatures.map(feature => {
                        const propName = getIdentifyingPropName(feature.properties)
                        const entityIdentifier =
                          getIdentifyingPropValue(feature.properties, propName) ||
                          'unknown'

                        return (
                          <tr>
                            <td>{feature.layer.id}</td>
                            <td>{entityIdentifier}</td>
                            <td>
                              <button
                                onClick={this.useAsEntity(
                                  entityIdentifier,
                                  propName,
                                  feature.properties
                                )}>
                                Select
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </Popup>
              )}
          </ReportsMap>
        </MapArea>
      </CreateReportView>
    )
  }
}

export default CreateReportPage
