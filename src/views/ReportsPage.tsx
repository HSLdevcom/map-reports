import * as React from 'react'
import styled from 'styled-components'
import ReportsMap from '../components/ReportsMap'
import ReportsList from '../components/ReportsList'
import { get } from 'lodash'
import { autorun, toJS } from 'mobx'
import { reportsQuery } from '../queries/reportsQuery'
import { app } from 'mobx-app'
import { inject, observer } from 'mobx-react'
import { query } from '../helpers/Query'
import { AnyFunction } from '../../shared/types/AnyFunction'
import { ReportActions } from '../../shared/types/ReportActions'
import osmtogeojson from 'osmtogeojson'
import { MapLayers } from '../components/Map'

const ReportsView = styled.div`
  height: 100%;
  display: grid;
  grid-template-columns: 30rem 1fr;
`

const Sidebar = styled.div`
  padding-top: 1rem;
  height: calc(100vh - 3rem);
  overflow: auto;
  display: flex;
`

const MapArea = styled.div`
  height: 100%;
`

type Props = {
  state?: any
  queryData?: any
  fetchMore?: AnyFunction
  refetch?: AnyFunction
  Report?: ReportActions
}

@inject(app('Report'))
@query({
  query: reportsQuery,
  getVariables: ({ state }) => ({
    perPage: 10,
    sort: toJS(state.sortReports),
    filter: toJS(state.filterReports.filter(f => !!f.key)),
  }),
})
@observer
class ReportsPage extends React.Component<Props, any> {
  componentDidMount() {
    const { state, refetch } = this.props

    autorun(() => {
      refetch({ filter: toJS(state.filterReports) })
    })
  }

  render() {
    const { queryData, fetchMore, refetch, Report, state } = this.props

    const queryName = 'reportsConnection'
    const reports = get(queryData, `${queryName}.edges`, []).map(edge => edge.node)

    const focusedReportId = state.focusedReport
    const focusedReport = reports.find(r => r.id === focusedReportId)

    let highlightGeoJson = null

    if (focusedReport) {
      const parsedData = JSON.parse(get(focusedReport, 'item.data', '{}'))

      if (parsedData.type === 'way' || parsedData.type === 'node') {
        highlightGeoJson = osmtogeojson({ elements: [parsedData] })
      } else if (
        parsedData.type === 'FeatureCollection' ||
        parsedData.type === 'Feature'
      ) {
        highlightGeoJson = parsedData
      }
    }

    return (
      <ReportsView>
        <Sidebar>
          <ReportsList reports={reports} fetchMore={fetchMore} refetchReports={refetch} />
        </Sidebar>
        <MapArea>
          <ReportsMap
            defaultLayer={MapLayers.VECTOR}
            highlightGeoJson={highlightGeoJson}
            reports={reports}
            onMapClick={() => Report.focusReport(null)}
          />
        </MapArea>
      </ReportsView>
    )
  }
}

export default ReportsPage
