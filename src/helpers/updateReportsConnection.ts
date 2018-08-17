import { get } from 'lodash'
import { emptyArguments, reportsQuery } from '../queries/reportsQuery'
import createCursor from '../../shared/utils/createCursor'
import { toJS } from 'mobx'

// The first function needs props (and state) and will return the update function.
const updateReportsConnection = ({ state }) => (store, { data }) => {
  const queryProp = 'reportsConnection'
  const operationName = Object.keys(data)[0]
  const operationResult = get(data, operationName, null)

  if (operationResult) {
    // Use the same variables as were used the previous time this query was run.
    const variables = !state
      ? emptyArguments
      : {
          perPage: 10,
          sort: toJS(state.sortReports),
          filter: toJS(state.filterReports.filter(f => !!f.key)),
        }

    const query = reportsQuery

    const resultData = {
      // Create a cursor for the item that should be the same as what the server creates.
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
