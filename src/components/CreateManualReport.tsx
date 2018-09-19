import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { toJS } from 'mobx'
import { AnyFunction } from '../../shared/types/AnyFunction'
import { ReportDraft } from '../../shared/types/Report'
import { RouterType } from 'pathricia'
import routes from '../routes'
import { ReportActions } from '../../shared/types/ReportActions'
import { Button, Divider, Typography } from '@material-ui/core'
import styled from 'styled-components'
import CreateReport from './CreateReport'
import { ReportSubject } from '../../shared/types/ReportSubject'
import { Location } from '../../shared/types/Location'

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
  reportSubject: ReportSubject
}

const FormWrapper = styled.div`
  padding: 1rem;
`

const FormGroup = styled.div`
  margin: 1rem 0;
`

const ValueDisplay = styled.div`
  margin-bottom: 1rem;
`

// If we want the router, app() from mobx-app cannot be used.
// I might fix this in a later mobx-app version.
@inject('state', 'actions', 'router')
@observer
class CreateManualReport extends React.Component<Props, any> {
  componentDidMount() {
    const { Report, Map } = this.props.actions
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

  onSubmitted = () => {
    const { router, actions } = this.props

    actions.Report.focusReport(null)
    router.go(routes.REPORTS)
  }

  render() {
    const { state, reportSubject } = this.props
    const location = state.lastClickedLocation

    return (
      <FormWrapper>
        <Typography variant="headline">Create report</Typography>
        <FormGroup>
          <ValueDisplay>
            Location: <code>{JSON.stringify(toJS(location))}</code>
          </ValueDisplay>
          <Button variant="outlined" type="button" onClick={this.pickCurrentLocation}>
            Use current location
          </Button>
        </FormGroup>
        <Divider />
        <CreateReport
          title="Manual report"
          location={location}
          reportSubject={reportSubject}
          onSubmitted={this.onSubmitted}
        />
      </FormWrapper>
    )
  }
}

export default CreateManualReport
