import { get } from 'lodash'
import { AnyFunction } from '../../shared/types/AnyFunction'

export const updateApolloCache = (
  query: any,
  variables: any,
  getData: AnyFunction,
  typename: string | boolean = false
) => (store, { data }) => {
  const operationName = Object.keys(data)[0]
  let mutationResult = get(data, operationName, {})

  if (typeof typename === 'string') {
    mutationResult = { ...mutationResult, __typename: typename }
  }

  let existingData

  try {
    existingData = store.readQuery({
      query,
      variables,
    })
  } catch (err) {
    existingData = false
  }

  const newData = getData(existingData, mutationResult)

  if (
    newData ||
    (Array.isArray(newData) && newData.length !== 0) ||
    (typeof newData === 'object' && Object.keys(newData).length !== 0)
  ) {
    store.writeQuery({
      query,
      variables,
      data: newData,
    })
  }
}
