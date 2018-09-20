import * as React from 'react'
import { DatasetType, Inspection, InspectionType } from '../../shared/types/Inspection'
import { mutate } from '../helpers/Mutation'
import { observer } from 'mobx-react'
import gql from 'graphql-tag'
import { query } from '../helpers/Query'
import { InspectionFragment } from '../fragments/InspectionFragment'
import { Button, Grid, InputLabel, TextField, Typography } from '@material-ui/core'
import { get, map } from 'lodash'
import Select from '../helpers/Select'
import CSVtoGeoJSON from '../components/CSVtoGeoJSON'
import EntityIdentifierFromGeoJSON from '../components/EntityIdentifierFromGeoJSON'
import styled from 'styled-components'

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

const FormSection = styled.div`
  margin: 1rem 0;
  padding: 0 1rem;
`

const Field = styled(TextField)`
  width: 100%;
`

@query({ query: allInspectionsQuery })
@mutate({
  mutation: createInspectionMutation,
  update: updateInspectionsList,
})
@observer
class CreateInspectionPage extends React.Component<any, Inspection> {
  state = {
    name: 'New inspection',
    type: InspectionType.MANUAL,
    datasetType: DatasetType.NONE,
    datasetUri: '',
    cron: '',
    entityIdentifier: 'unknown',
    geoJSONProps: '{}',
  }

  onChange = field => e => {
    this.setState({
      ...this.state,
      [field]: get(e, 'target.value', e),
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
    const {
      name,
      type,
      datasetType,
      datasetUri,
      cron,
      geoJSONProps,
      entityIdentifier,
    } = this.state

    return (
      <form onSubmit={this.onSubmit}>
        <FormSection>
          <Typography variant="subheading">Inspections</Typography>
          {get(queryData, 'inspections', []).map(inspection => (
            <div key={`inspection_${inspection.id}`}>{inspection.name}</div>
          ))}
        </FormSection>
        <FormSection>
          <TextField
            label="Inspection name"
            value={name}
            onChange={this.onChange('name')}
          />
        </FormSection>
        <FormSection>
          <InputLabel>Inspection type</InputLabel>
          <Select
            name="inspection_type"
            value={type}
            options={map(InspectionType, (value, label) => ({ value, label }))}
            onChange={this.onChange('type')}
          />
        </FormSection>
        <FormSection>
          <InputLabel>Dataset type</InputLabel>
          <Select
            name="dataset_type"
            value={datasetType}
            options={map(DatasetType, (value, label) => ({ value, label }))}
            onChange={this.onChange('datasetType')}
          />
        </FormSection>
        {type !== InspectionType.MANUAL && (
          <FormSection>
            <Field
              label="Dataset uri"
              value={datasetUri}
              onChange={this.onChange('datasetUri')}
            />
          </FormSection>
        )}
        {type === InspectionType.CRON && (
          <FormSection>
            <TextField label="Cron" value={cron} onChange={this.onChange('cron')} />
          </FormSection>
        )}
        {datasetType === DatasetType.CSV && (
          <FormSection>
            <CSVtoGeoJSON
              value={geoJSONProps}
              onChange={this.onChange('geoJSONProps')}
              datasetUri={datasetUri}
            />
          </FormSection>
        )}
        {type !== InspectionType.MANUAL && (
          <FormSection>
            <EntityIdentifierFromGeoJSON
              value={entityIdentifier}
              onChange={this.onChange('entityIdentifier')}
              datasetUri={datasetUri}
              mapToGeoJSON={geoJSONProps}
            />
          </FormSection>
        )}
        <FormSection>
          <Button type="submit" variant="raised">
            Create inspection
          </Button>
        </FormSection>
      </form>
    )
  }
}

export default CreateInspectionPage
