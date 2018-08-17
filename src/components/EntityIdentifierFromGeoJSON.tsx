import * as React from 'react'
import { observer } from 'mobx-react'
import { action, observable } from 'mobx'
import geoJson from 'geojson'
import { map, get } from 'lodash'
import { Divider, FormGroup, InputLabel, TextField, Typography } from '@material-ui/core'
import Select from '../helpers/Select'
import neatCsv from 'neat-csv'
import { AnyFunction } from '../../shared/types/AnyFunction'
import fetchSampleAsGeoJSON from '../helpers/fetchSampleAsGeoJSON'

interface Props {
  value: string
  onChange: AnyFunction
  mapToGeoJSON: string
  datasetUri: string
}

@observer
class EntityIdentifierFromGeoJSON extends React.Component<Props, any> {
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
    const { datasetUri = '', mapToGeoJSON } = this.props

    if (datasetUri !== this.lastFetchedUrl || !this.dataSample) {
      const sample = await fetchSampleAsGeoJSON(datasetUri, mapToGeoJSON)
      this.setDataSample(sample)
    }
  }

  render() {
    const { value, onChange } = this.props

    if (this.dataSample !== null) {
      const dataSampleOptions = map(this.dataSample, (value, key) => key)

      return (
        <div>
          <Typography variant="subheading">Data sample</Typography>
          <pre>
            <code>{JSON.stringify(this.dataSample, null, 2)}</code>
          </pre>
          <Divider />
          {this.dataSample !== false ? (
            <FormGroup>
              <InputLabel>Select entity identifier</InputLabel>
              <Select
                name="select_entity_id"
                value={value}
                onChange={onChange}
                options={[
                  { value: '', label: 'Select entity identifier' },
                  ...dataSampleOptions,
                ]}
              />
            </FormGroup>
          ) : (
            <FormGroup>
              <InputLabel>Set entity identifier</InputLabel>
              <TextField name="input_entity_id" value={value} onChange={onChange} />
            </FormGroup>
          )}
        </div>
      )
    }

    return null
  }
}

export default EntityIdentifierFromGeoJSON
