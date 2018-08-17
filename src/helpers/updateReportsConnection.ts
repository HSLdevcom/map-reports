import { get } from 'lodash'
import { emptyArguments, reportsQuery } from '../queries/reportsQuery'
import createCursor from '../../server/util/createCursor'
import { toJS } from 'mobx'

// The first function needs props (and state) and will return the update function.
const updateReportsConnection = ({ state }) => (store, { data }) => {
  const queryProp = 'reportsConnection'
  const operationName = Object.keys(data)[0]
  const operationResult = get(data, operationName, null)

  if (operationResult) {
    const variables = !state
      ? emptyArguments
      : {
          perPage: 10,
          sort: toJS(state.sortReports),
          filter: toJS(state.filterReports.filter(f => !!f.key)),
        }

    const query = reportsQuery

    const resultData = {
      cursor: createCursor(operationResult, {
        filter: variables.filter,
        sort: variables.sort,
      }),
      node: operationResult,
      __typename: 'ReportsEdge',
    }

    let cachedData

    try {
      cachedData = store.readQuery({ query, variables })
    } catch (err) {
      cachedData = { [queryProp]: { edges: [] } }
    }

    cachedData[queryProp].edges.unshift(resultData)
    store.writeQuery({ query, variables, data: cachedData })
  }
}

export default updateReportsConnection
