import { DatabaseWrapper } from '../database'
import { reduce } from 'lodash'

export function createRelationResolver(db: DatabaseWrapper, relationsToDbMap: {}) {
  const relations = reduce(
    relationsToDbMap,
    (relationsData, tableName, relationProp) => {
      relationsData[relationProp] = {
        resolved: [],
        db: db.table(tableName),
      }

      return relationsData
    },
    {}
  )

  return async obj => {
    const returnObj = { ...obj }

    for (const objProp in obj) {
      if (objProp in relations === false || typeof obj[objProp] !== 'string') {
        continue
      }

      let related = relations[objProp].resolved.find(r => r.id === obj[objProp])

      if (!related) {
        related = await relations[objProp].db.get(obj[objProp])
        relations[objProp].resolved.push(related)
      }

      returnObj[objProp] = related
    }

    return returnObj
  }
}
