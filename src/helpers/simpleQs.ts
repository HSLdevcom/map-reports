import { reduce } from 'lodash'

export function stringify(obj) {
  if (Object.keys(obj).length === 0) {
    return ''
  }

  const stringified = reduce(
    obj,
    (qs, value, key) => {
      qs += `${key}=${value}&`
      return qs
    },
    ''
  )

  return stringified.replace(/&\s*$/, '') // Remove last &
}
