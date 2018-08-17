import createInspectionFromSpec from '../../inspections/createInspection'
import { get } from 'lodash'
import runInspections from '../../inspections/runInspections'

const inspectionResolvers = db => {
  const inspectionsDb = db.table('inspection')

  async function getInspection(_, { inspectionId }) {
    return inspectionsDb.get(inspectionId)
  }

  async function allInspections() {
    return inspectionsDb.get()
  }

  async function createInspection(_, { inspection }) {
    const inspectionObj = createInspectionFromSpec(inspection)

    console.log(inspectionObj)

    const insertedId = await inspectionsDb.add(inspectionObj)
    const insertedInspection = await inspectionsDb.get(get(insertedId, '[0]', insertedId))
    await runInspections([insertedInspection], inspectionsDb)

    return insertedInspection
  }

  return {
    getInspection,
    allInspections,
    createInspection,
  }
}

export default inspectionResolvers
