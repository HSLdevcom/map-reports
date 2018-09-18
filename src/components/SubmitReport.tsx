import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { mutate } from '../helpers/Mutation'
import { action, toJS } from 'mobx'
import gql from 'graphql-tag'
import { ReportFragment } from '../fragments/ReportFragment'
import { AnyFunction } from '../../shared/types/AnyFunction'
import { ReportDraft } from '../../shared/types/Report'
import { RouterType } from 'pathricia'
import routes from '../routes'
import { ReportActions } from '../../shared/types/ReportActions'
import { Button, TextField, Divider, Typography } from '@material-ui/core'
import styled from 'styled-components'
import updateReportsConnection from '../helpers/updateReportsConnection'

const createReportMutation = gql`
  mutation createReport($reportData: InputReport!, $reportItem: InputReportItem!) {
    createReport(reportData: $reportData, reportItem: $reportItem) {
      ...ReportFields
    }
  }
  ${ReportFragment}
`

type Props = {
  mutate?: AnyFunction
  Report?: {
    focusReport: (reportId?: string) => void
  }
  state?: {
    lastClickedLocation?: Location
    reportDraft: ReportDraft
  }
  router?: RouterType
  actions?: {
    Map?: any
    Report?: ReportActions
  }
}

const CreateReportForm = styled.form`
  width: 100%;
  padding: 1rem;
`

const FormGroup = styled.div`
  margin: 1rem 0;
`

const Input = styled(TextField)``

const ValueDisplay = styled.div`
  margin-bottom: 1rem;
`

// If we want the router, app() from mobx-app cannot be used.
// I might fix this in a later mobx-app version.
@inject('state', 'actions', 'router')
@mutate({
  mutation: createReportMutation,
  update: updateReportsConnection,
})
@observer
class SubmitReport extends React.Component<Props, any> {
  componentDidMount() {
    const { Report, Map } = this.props.actions
    Report.createReport()
    Report.focusReport('clicked_location')
    Map.setClickedLocation(null)
  }

  pickCurrentLocation = () => {
    const { Report, Map } = this.props.actions
    Report.focusReport(null)

    navigator.geolocation.getCurrentPosition(({ coords }) => {
      Map.setClickedLocation({ lat: coords.latitude, lon: coords.longitude })
      Report.focusReport('clicked_location')
    })
  }

  onChange = which =>
    action((e: React.ChangeEvent<any>) => {
      this.props.state.reportDraft[which] = e.target.value
    })

  onSubmit = e => {
    e.preventDefault()

    const { mutate, state, router, actions } = this.props
    const { title, message, entityIdentifier, data, type } = state.reportDraft
    const location = state.lastClickedLocation

    mutate({
      variables: {
        reportData: {
          title,
          message,
        },
        reportItem: {
          ...location,
          entityIdentifier,
          type,
          data,
          recommendedMapZoom: 16,
        },
      },
    })

    actions.Report.focusReport(null)
    router.go(routes.REPORTS)
  }

  render() {
    const { state } = this.props
    const { title, message, entityIdentifier, data, type } = state.reportDraft
    const location = state.lastClickedLocation

    return (
      <CreateReportForm onSubmit={this.onSubmit}>
        <Typography variant="headline">Create report</Typography>
        <FormGroup>
          <Input
            value={title}
            onChange={this.onChange('title')}
            label="Title"
            margin="normal"
            fullWidth
            autoFocus
          />
        </FormGroup>
        <FormGroup>
          <Input
            multiline
            rowsMax="5"
            fullWidth
            value={message}
            onChange={this.onChange('message')}
            label="Message"
            margin="normal"
          />
        </FormGroup>
        <Divider />
        <FormGroup>
          <ValueDisplay>
            Location: <code>{JSON.stringify(toJS(location))}</code>
          </ValueDisplay>
          <Button variant="outlined" type="button" onClick={this.pickCurrentLocation}>
            Use current location
          </Button>
        </FormGroup>
        <Divider />
        <FormGroup>
          <ValueDisplay>
            {type}: <code>{entityIdentifier}</code>
          </ValueDisplay>
          <ValueDisplay>
            Properties:{' '}
            <pre>
              <code>{JSON.stringify(JSON.parse(data), null, 2)}</code>
            </pre>
          </ValueDisplay>
        </FormGroup>
        <Divider />
        <FormGroup>
          <Button variant="contained" color="primary" type="submit">
            Send
          </Button>
        </FormGroup>
      </CreateReportForm>
    )
  }
}

export default SubmitReport
