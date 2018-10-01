import * as React from 'react'
import { Divider, TextField, Button } from '@material-ui/core'
import styled from 'styled-components'
import gql from 'graphql-tag'
import { ReportFragment } from '../fragments/ReportFragment'
import { mutate } from '../helpers/Mutation'
import updateReportsConnection from '../helpers/updateReportsConnection'
import { observer } from 'mobx-react'
import { observable, action } from 'mobx'
import { get, pick } from 'lodash'
import { AnyFunction } from '../../shared/types/AnyFunction'
import { Location } from '../../shared/types/Location'
import { ReportSubject } from '../../shared/types/ReportSubject'

const createReportMutation = gql`
  mutation createReport($reportData: InputReport!, $reportItem: InputReportItem!) {
    createReport(reportData: $reportData, reportItem: $reportItem) {
      ...ReportFields
    }
  }
  ${ReportFragment}
`

const FormGroup = styled.div`
  margin: 1rem 0;
`

const Input = styled(TextField)``

const ValueDisplay = styled.div`
  margin-bottom: 1rem;
`

const CreateReportForm = styled.form`
  width: 100%;
`

interface Props {
  mutate?: AnyFunction
  title?: string
  location?: Location
  reportSubject: ReportSubject
  onSubmitted?: AnyFunction
}

@mutate({
  mutation: createReportMutation,
  update: updateReportsConnection,
})
@observer
class CreateReport extends React.Component<Props, any> {
  @observable
  draft = {
    title: '',
    message: '',
  }

  onChange = which =>
    action((e: React.ChangeEvent<any>) => (this.draft[which] = e.target.value))

  onSubmit = async e => {
    e.preventDefault()

    const { mutate, location, reportSubject, onSubmitted = () => {} } = this.props

    const { entityIdentifier, data, type } = reportSubject
    const { message, title } = this.draft

    await mutate({
      variables: {
        reportData: {
          title,
          message,
        },
        reportItem: {
          ...location,
          entityIdentifier,
          type,
          data: typeof data === 'string' ? data : JSON.stringify(data),
          recommendedMapZoom: 16,
        },
      },
    })

    onSubmitted()
  }

  render() {
    const { reportSubject } = this.props
    const { entityIdentifier, data } = reportSubject
    const { message, title } = this.draft

    const parsedData = typeof data === 'string' ? JSON.parse(data) : data

    return (
      <CreateReportForm onSubmit={this.onSubmit}>
        <FormGroup>
          <Input
            fullWidth
            value={title}
            onChange={this.onChange('title')}
            label="Title"
            margin="normal"
          />

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
            Identifier: <code>{entityIdentifier}</code>
          </ValueDisplay>
          <ValueDisplay>
            Properties:{' '}
            <pre>
              <code>
                {JSON.stringify(pick(parsedData, 'tags', 'properties'), null, 2)}
              </code>
            </pre>
          </ValueDisplay>
        </FormGroup>
        <Divider />
        <FormGroup>
          <Button variant="contained" color="primary" type="submit">
            Create report
          </Button>
        </FormGroup>
      </CreateReportForm>
    )
  }
}

export default CreateReport
