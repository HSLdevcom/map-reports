import createInspectionFromSpec from '../../inspections/createInspection'
import { get } from 'lodash'
import runInspections from '../../inspections/runInspections'

const inspectionResolvers = db => {
  const inspectionsDb = db.table('inspection')

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

    const insertedInspection = { ...inspectionObj, ...get(inserted, '[0]', {}) }
    await runInspections([insertedInspection], inspectionsDb)

    return insertedInspection
  }

  return {
    allInspections,
    createInspection,
  }
}

export default inspectionResolvers
