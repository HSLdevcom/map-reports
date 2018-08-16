import * as React from 'react'
import neatCsv from 'neat-csv'
import geoJson from 'geojson'
import { observer } from 'mobx-react'
import { action, computed, observable, toJS } from 'mobx'
import { Divider, Grid, Typography, InputLabel, FormControl } from '@material-ui/core'
import Select from '../helpers/Select'
import { map, get, omit } from 'lodash'

enum GeometryType {
  'Point' = 'Point',
  'LineString' = 'LineString',
  'MultiLineString' = 'MultiLineString',
  'Polygon' = 'Polygon',
}

@observer
class SelectPointProps extends React.Component<any, any> {
  state = {
    lat: 0,
    lng: 0,
  }

  setPointProp = (prop: 'lat' | 'lng') => e => {
    this.setState({
      [prop]: e.target.value,
    })
  }

  componentDidUpdate(_, { lat: prevLat, lng: prevLng }) {
    const { lat, lng } = this.state
    const { onSelected } = this.props

    if (lat && lng && (lat !== prevLat || lng !== prevLng)) {
      onSelected([lat, lng])
    }
  }

  render() {
    const { lat, lng } = this.state
    const { options } = this.props

    return (
      <FormControl>
        <InputLabel>Add point</InputLabel>
        <div>
          <Select
            name="add_point_lat"
            value={lat}
            options={[
              { value: 0, label: 'Select lat prop' },
              ...options.filter(opt => opt.value !== lng),
            ]}
            onChange={this.setPointProp('lat')}
          />
          <Select
            name="add_point_lng"
            value={lng}
            options={[
              { value: 0, label: 'Select lng prop' },
              ...options.filter(opt => opt.value !== lat),
            ]}
            onChange={this.setPointProp('lng')}
          />
        </div>
      </FormControl>
    )
  }
}

@observer
class CSVtoGeoJSON extends React.Component<any, any> {
  @observable.ref
  dataSample: any = null

  @observable
  lastFetchedUrl: string = ''

  @observable.ref
  geoJsonMapping: any = {
    include: [],
  }

  @computed
  get geoJsonFeature() {
    let geoJsonObject = {}

    try {
      geoJsonObject = geoJson.parse(toJS(this.dataSample), {
        ...toJS(this.geoJsonMapping),
      })
    } catch (err) {
      geoJsonObject = {}
    }

    return JSON.stringify(geoJsonObject, null, 2)
  }

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

    let url = datasetUri

    try {
      url = new URL(datasetUri).href
    } catch (err) {
      url = ''
    }

    if (url && url !== this.lastFetchedUrl) {
      this.setLastFetched(url)

      const datasetReq = await fetch(url)
      const datasetCsv = await datasetReq.text()
      const dataset = await neatCsv(datasetCsv)

      const sample = Array.isArray(dataset)
        ? dataset[0]
        : dataset[Object.keys(dataset)[0]]

      this.setDataSample(sample)
    }
  }

  addGeometry = (type: GeometryType) =>
    action((coordinateProps: string | string[]) => {
      if (!coordinateProps) {
        this.geoJsonMapping = omit(this.geoJsonMapping, type)
      } else {
        this.geoJsonMapping = {
          ...this.geoJsonMapping,
          [type]: coordinateProps,
        }
      }
    })

  @action
  includeProperty = prop => {
    this.geoJsonMapping = {
      ...this.geoJsonMapping,
      include: [...this.geoJsonMapping.include, prop],
    }
  }

  render() {
    if (this.dataSample) {
      const dataSampleOptions = map(this.dataSample, (value, key) => key)

      console.log(toJS(this.geoJsonMapping))

      return (
        <div>
          <Typography variant="subheading">CSV data sample</Typography>
          <pre>
            <code>{JSON.stringify(this.dataSample, null, 2)}</code>
          </pre>
          <Divider />
          {Object.keys(this.geoJsonMapping).length > 1 && (
            <React.Fragment>
              <Typography variant="subheading">GeoJSON feature</Typography>
              <pre>
                <code>{this.geoJsonFeature}</code>
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
            <Grid item xs={3}>
              <InputLabel>Add polygon</InputLabel>
              <Select
                name="select_polygon_prop"
                value={get(this, 'geoJsonMapping.Polygon', '')}
                onChange={e => this.addGeometry(GeometryType.Polygon)(e.target.value)}
                options={[
                  { value: '', label: 'Select polygon prop' },
                  ...dataSampleOptions,
                ]}
              />
            </Grid>
            <Grid item xs={3}>
              <InputLabel>Add LineString</InputLabel>
              <Select
                name="select_linestring_prop"
                value={get(this, 'geoJsonMapping.LineString', '')}
                onChange={e => this.addGeometry(GeometryType.LineString)(e.target.value)}
                options={[
                  { value: '', label: 'Select LineString prop' },
                  ...dataSampleOptions,
                ]}
              />
            </Grid>
            <Grid item xs={3}>
              <InputLabel>Add MultiLineString</InputLabel>
              <Select
                name="select_multilinestring_prop"
                value={get(this, 'geoJsonMapping.MultiLineString', '')}
                onChange={e =>
                  this.addGeometry(GeometryType.MultiLineString)(e.target.value)
                }
                options={[
                  { value: '', label: 'Select MultiLineString prop' },
                  ...dataSampleOptions,
                ]}
              />
            </Grid>
          </Grid>
        </div>
      )
    }

    return null
  }
}

export default CSVtoGeoJSON
