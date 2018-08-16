import * as React from 'react'
import { DatasetType, InspectionSpec, InspectionType } from '../../types/Inspection'
import { mutate } from '../helpers/Mutation'
import { observer } from 'mobx-react'
import gql from 'graphql-tag'
import { query } from '../helpers/Query'
import { InspectionFragment } from '../fragments/InspectionFragment'
import { Button, Grid, InputLabel, TextField, Typography } from '@material-ui/core'
import { get, map } from 'lodash'
import Select from '../helpers/Select'
import CSVtoGeoJSON from '../components/CSVtoGeoJSON'

const allInspectionsQuery = gql`
  query allInspections {
    inspections {
      ...InspectionFields
    }
  }
  ${InspectionFragment}
`

const createInspectionMutation = gql`
  mutation createInspection($inspection: InspectionSpecInput) {
    createInspection(inspection: $inspection) {
      ...InspectionFields
    }
  }
  ${InspectionFragment}
`

const updateInspectionsList = (cache, { data: { createInspection } }) => {
  const { inspections } = cache.readQuery({ query: allInspectionsQuery })
  cache.writeQuery({
    query: allInspectionsQuery,
    data: { inspections: inspections.concat([createInspection]) },
  })
}

@query({ query: allInspectionsQuery })
@mutate({
  mutation: createInspectionMutation,
  update: updateInspectionsList,
})
@observer
class CreateInspectionPage extends React.Component<any, InspectionSpec> {
  state = {
    name: 'New inspection',
    type: InspectionType.MANUAL,
    datasetType: DatasetType.NONE,
    datasetUri: '',
    cron: '',
    convertData: '{}',
  }

  onChange = field => e => {
    this.setState({
      ...this.state,
      [field]: e.target.value,
    })
  }

  onSubmit = e => {
    e.preventDefault()
    const { mutate } = this.props

    mutate({
      variables: {
        inspection: this.state,
      },
    })
  }

  render() {
    const { queryData } = this.props
    const { name, type, datasetType, datasetUri, cron, convertData } = this.state

    return (
      <form onSubmit={this.onSubmit} style={{ width: '100%' }}>
        <Grid container spacing={0} style={{ maxWidth: '100%' }}>
          <Grid item xs={12}>
            <TextField
              label="Inspection name"
              value={name}
              onChange={this.onChange('name')}
            />
          </Grid>
          <Grid item xs={12}>
            <InputLabel>Inspection type</InputLabel>
            <Select
              name="inspection_type"
              value={type}
              options={map(InspectionType, (value, label) => ({ value, label }))}
              onChange={this.onChange('type')}
            />
          </Grid>
          <Grid item xs={12}>
            <InputLabel>Dataset type</InputLabel>
            <Select
              name="dataset_type"
              value={datasetType}
              options={map(DatasetType, (value, label) => ({ value, label }))}
              onChange={this.onChange('datasetType')}
            />
          </Grid>
          {type !== InspectionType.MANUAL && (
            <Grid item xs={12}>
              <TextField
                label="Dataset uri"
                value={datasetUri}
                onChange={this.onChange('datasetUri')}
              />
            </Grid>
          )}
          {type === InspectionType.CRON && (
            <Grid item xs={12}>
              <TextField label="Cron" value={cron} onChange={this.onChange('cron')} />
            </Grid>
          )}
          {datasetType === DatasetType.CSV && <CSVtoGeoJSON datasetUri={datasetUri} />}
          <Grid item xs={12}>
            <Button type="submit" variant="raised">
              Create inspection
            </Button>
          </Grid>
        </Grid>
      </form>
    )
  }
}

export default CreateInspectionPage
