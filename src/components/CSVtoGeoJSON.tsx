import * as React from 'react'
import geoJson from 'geojson'
import { observer } from 'mobx-react'
import { action, observable, toJS } from 'mobx'
import { Divider, Grid, Typography, InputLabel } from '@material-ui/core'
import Select from '../helpers/Select'
import { map, get, omit, set } from 'lodash'
import SelectPointProps from '../helpers/SelectPointProps'
import fetchSampleCsv from '../helpers/fetchSampleCsv'

enum GeometryType {
  'Point' = 'Point',
  'LineString' = 'LineString',
  'MultiLineString' = 'MultiLineString',
  'Polygon' = 'Polygon',
}

@observer
class CSVtoGeoJSON extends React.Component<any, any> {
  @observable.ref
  dataSample: any = null
  @observable
  lastFetchedUrl: string = ''

  @action
  setDataSample = sample => (this.dataSample = sample)
  @action
  setLastFetched = lastFetchedUrl => (this.lastFetchedUrl = lastFetchedUrl)

  async componentDidUpdate() {
    await this.sampleData()
  }

  async componentDidMount() {
    await this.sampleData()
  }

  sampleData = async () => {
    const { datasetUri = '' } = this.props

    if (datasetUri !== this.lastFetchedUrl) {
      const sample = await fetchSampleCsv(datasetUri)
      this.setDataSample(sample)
    }
  }

  createGeoJsonFeature(value) {
    let geoJsonObject = {}

    try {
      geoJsonObject = geoJson.parse(toJS(this.dataSample), JSON.parse(value))
    } catch (err) {
      geoJsonObject = {}
    }

    return JSON.stringify(geoJsonObject, null, 2)
  }

  addGeometry = (type: GeometryType) => (coordinateProps: string | string[]) => {
    const { value, onChange } = this.props
    const parsedVal = JSON.parse(value)

    if (!coordinateProps) {
      onChange(JSON.stringify(omit(parsedVal, type)))
    } else {
      onChange(JSON.stringify(set(parsedVal, type, coordinateProps)))
    }
  }

  render() {
    const { value } = this.props

    if (this.dataSample) {
      const dataSampleOptions = map(this.dataSample, (value, key) => key)
      const parsedVal = JSON.parse(value)

      return (
        <div>
          <Typography variant="subheading">CSV data sample</Typography>
          <pre>
            <code>{JSON.stringify(this.dataSample, null, 2)}</code>
          </pre>
          <Divider />
          {value && (
            <React.Fragment>
              <Typography variant="subheading">GeoJSON feature</Typography>
              <pre>
                <code>{this.createGeoJsonFeature(value)}</code>
              </pre>
              <Divider />
            </React.Fragment>
          )}
          <Grid container>
            <Grid item xs={3}>
              <SelectPointProps
                onSelected={this.addGeometry(GeometryType.Point)}
                options={dataSampleOptions}
              />
            </Grid>
            {/* Add selects for the rest of the geometry types. Assume that Point is first in the enum and skip it. */}
            {Object.keys(GeometryType)
              .slice(1)
              .map((geometryType, idx) => (
                <Grid key={`select_geometry_${geometryType}_${idx}`} item xs={3}>
                  <InputLabel>Add {geometryType}</InputLabel>
                  <Select
                    name={`select_${geometryType}_prop`}
                    value={get(parsedVal, geometryType, '')}
                    onChange={e =>
                      this.addGeometry(GeometryType[geometryType])(e.target.value)
                    }
                    options={[
                      { value: '', label: `Select ${geometryType} prop` },
                      ...dataSampleOptions,
                    ]}
                  />
                </Grid>
              ))}
          </Grid>
        </div>
      )
    }

    return null
  }
}

export default CSVtoGeoJSON
