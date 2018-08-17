import * as React from 'react'
import gql from 'graphql-tag'
import { inject, observer } from 'mobx-react'
import { query } from '../helpers/Query'
import styled from 'styled-components'
import {
  Card,
  Typography,
  Divider,
  Switch,
  FormGroup,
  FormLabel,
} from '@material-ui/core'
import Select from '../helpers/Select'
import { get } from 'lodash'
import DatasetMap from '../components/DatasetMap'

const datasetOptionsQuery = gql`
  {
    inspections {
      id
      name
    }
  }
`

const DatasetsWrapper = styled.div`
  position: relative;
`

const OptionsBox = styled(Card)`
  position: absolute;
  top: 0.7rem;
  left: 3.5rem;
  width: 20%;
  min-width: 300px;
  padding: 1rem;
`

@inject('actions', 'state', 'router')
@query({ query: datasetOptionsQuery, fetchPolicy: 'cache-first' })
@observer
class InspectDatasets extends React.Component<any, any> {
  state = {
    useVectorLayers: true,
  }

  onChangeDataset = e => {
    const {
      actions: { UI },
    } = this.props
    UI.selectDataset(e.target.value)
  }

  toggleVectorLayers = () => {
    this.setState({
      useVectorLayers: !this.state.useVectorLayers,
    })
  }

  render() {
    const { useVectorLayers } = this.state
    const { queryData, loading, state } = this.props

    if (!queryData || loading) {
      return 'Loading...'
    }

    return (
      <DatasetsWrapper>
        {state.selectedDataset && (
          <DatasetMap
            useVectorLayers={useVectorLayers}
            datasetId={state.selectedDataset}
          />
        )}
        <OptionsBox>
          <Typography gutterBottom variant="headline" component="h2">
            Tarkastele ja raportoi
          </Typography>
          <Select value={state.selectedDataset} onChange={this.onChangeDataset}>
            {[
              { value: '', label: 'Valitse kartta' },
              ...queryData.inspections.map(({ id, name }) => ({
                value: id,
                label: name,
              })),
            ]}
          </Select>
          <Divider />
          <Switch
            value="useVectorLayers"
            checked={useVectorLayers}
            onChange={this.toggleVectorLayers}
          />
          <FormLabel>Use vector map</FormLabel>
        </OptionsBox>
      </DatasetsWrapper>
    )
  }
}

export default InspectDatasets
