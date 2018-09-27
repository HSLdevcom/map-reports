import * as React from 'react'
import styled from 'styled-components'
import ReportStatus from '../components/ReportStatus'
import ReportPriority from '../components/ReportPriority'
import { Report } from '../../shared/types/Report'
import { AnyFunction } from '../../shared/types/AnyFunction'
import { rgba } from 'polished'
import { get, omit } from 'lodash'
import { SlideDown } from 'react-slidedown'
import * as prettyJson from 'prettyjson'
import 'react-slidedown/lib/slidedown.css'
import gql from 'graphql-tag'
import { mutate } from '../helpers/Mutation'
import { observer } from 'mobx-react'
import { compose } from 'react-apollo'
import { Button } from '@material-ui/core'
import { Delete } from '@material-ui/icons'
import Comments from './Comments'

const Report = styled.div<{ type: string }>`
  cursor: pointer;
  padding: 1rem;
  border-bottom: 1px solid #efefef;
  background: ${({ type = 'general' }) => {
    switch (type) {
      case 'stop':
        return rgba('darkorchid', 0.2)
      case 'general':
      default:
        return rgba('#55aaff', 0.2)
    }
  }};
`

const ReportHeading = styled.header`
  display: grid;
  grid-template-columns: 1fr 3rem;
  grid-gap: 1rem;
  align-items: center;
  justify-content: space-around;

  > h2 {
    font-size: 1em;
    margin-top: 0;
    margin-bottom: 0;
  }

  > button {
    flex: none;
    text-align: right;
    align-items: flex-end;
    padding: 0;
    min-width: 0;
  }
`

const ReportBody = styled.article`
  font-size: 0.8em;
  display: flex;
  flex-wrap: nowrap;
  justify-content: flex-start;
  margin-top: 1rem;

  > * {
    margin: 0;
    margin: 0 0.5em;
    padding: 0 1em 0 0;
    border-right: 1px solid #ccc;
    flex: 1 1 auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;

    &:first-child {
      margin-left: 0;
      padding-left: 0;
    }

    &:last-child {
      border-right: 0;
      padding-right: 0;
    }
  }
`

const removeReportMutation = gql`
  mutation removeReport($id: String!) {
    removeReport(reportId: $id)
  }
`

const ReportContent = styled.div<{ json?: boolean }>`
  padding: 1rem 0 0;
  ${({ json = false }) => (json ? 'white-space: pre-line;' : '')};
`

const enhance = compose(
  mutate({ mutation: removeReportMutation }),
  observer
)

type Props = {
  report: Report
  onClick: AnyFunction
  mutate?: AnyFunction
  onRemove?: AnyFunction
}

class ReportItem extends React.Component<Props, any> {
  state = {
    isOpen: false,
  }

  onHeadingClick = e => {
    e.preventDefault()

    this.setState({
      isOpen: !this.state.isOpen,
    })
  }

  onRemoveClick = async e => {
    e.preventDefault()
    e.stopPropagation() // Do not select the report on the map

    const { onRemove = () => {}, mutate, report } = this.props

    await mutate({
      variables: {
        id: report.id,
      },
    })

    onRemove()
  }

  render() {
    const { report, onClick } = this.props

    const itemData = JSON.parse(get(report, 'item.data', '{}'))

    return (
      <Report type={get(report, 'item.type', 'manual')} onClick={onClick}>
        <ReportHeading onClick={this.onHeadingClick}>
          <h2>{report.title}</h2>
          <Button
            size="small"
            color="secondary"
            onClick={this.onRemoveClick}
            aria-label="Delete">
            <Delete />
          </Button>
        </ReportHeading>
        <ReportBody>
          <div>
            <ReportStatus report={report} readOnly={false} />
          </div>
          <div>
            <ReportPriority report={report} readOnly={false} />
          </div>
        </ReportBody>
        <SlideDown closed={!this.state.isOpen}>
          {report.message && <ReportContent>{report.message}</ReportContent>}
          {itemData && (
            <>
              <ReportContent json>
                {prettyJson.render(omit(itemData, 'bounds', 'geometry', 'nodes'))}
              </ReportContent>
              <Comments comments={report.comments} reportId={report.id} />
            </>
          )}
        </SlideDown>
      </Report>
    )
  }
}

export default enhance(ReportItem)
