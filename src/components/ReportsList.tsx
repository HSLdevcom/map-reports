import * as React from 'react'
import { observer, inject } from 'mobx-react'
import { RendersReports } from '../../types/RendersReports'
import SortAndFilter from './SortAndFilter'
import { app } from 'mobx-app'
import { Report as ReportType } from '../../types/Report'
import { ReportActions } from '../../types/ReportActions'
import styled from 'styled-components'
import Report from './Report'
import { AnyFunction } from '../../types/AnyFunction'

const List = styled.div`
  width: 100%;
`

interface Props extends RendersReports {
  state?: {
    sortReports: {
      key: string
      direction: string
    }
    filterReports: {
      key: string
      value: string
    }[]
  }
  refetch: AnyFunction
  reports: ReportType[]
  Report?: ReportActions
}

@inject(app('Report'))
@observer
class ReportsList extends React.Component<Props, any> {
  onRemoveReport = () => {
    this.props.refetch()
  }

  render() {
    const { reports = [], Report: ReportStore, fetchMore } = this.props

    return (
      <List>
        <SortAndFilter reports={reports} />
        {reports.map(report => (
          <Report
            onRemove={this.onRemoveReport}
            key={report.id}
            report={report}
            onClick={() => ReportStore.focusReport(report.id)}
          />
        ))}
        {typeof fetchMore === 'function' && (
          <button onClick={() => fetchMore()}>Fetch more</button>
        )}
      </List>
    )
  }
}

export default ReportsList
