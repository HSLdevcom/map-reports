import createInspectionFromSpec from '../../reporters/createInspection'
import { get } from 'lodash'

const inspectionResolvers = db => {
  const inspectionsDb = db.table('inspections')

  async function allInspections() {
    return inspectionsDb.get()
  }

  async function createInspection(_, { inspection }) {
    const inspectionObj = createInspectionFromSpec(inspection)
    const inserted = await inspectionsDb.add(inspectionObj, [
      'id',
      'created_at',
      'updated_at',
    ])
    return { ...inspectionObj, ...get(inserted, '[0]', {}) }
  }

  return {
    allInspections,
    createInspection,
  }
}

export default inspectionResolvers
