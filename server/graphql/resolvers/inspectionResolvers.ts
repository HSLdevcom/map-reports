import { get, merge } from 'lodash'
import runInspections from '../../inspections/runInspections'
import { Inspection } from '../../entity/Inspection'
import { Inspection as InspectionType } from '../../../shared/types/Inspection'

const inspectionResolvers = db => {
  const inspectionsRepo = db.getRepo(Inspection)

  async function getInspection(_, { inspectionId }): Promise<InspectionType> {
    return inspectionsRepo.findOne({ id: inspectionId, relations: ['reports'] })
  }

  async function allInspections(): Promise<InspectionType[]> {
    return inspectionsRepo.find({ relations: ['reports'] })
  }

  async function createInspection(_, { inspection }): Promise<InspectionType> {
    const inspectionEntity = new inspection()
    Object.assign(inspectionEntity, inspection)

    await inspectionsRepo.save(inspectionEntity)

    await runInspections([inspectionEntity], inspectionsRepo)

    return inspectionEntity
  }

  return {
    getInspection,
    allInspections,
    createInspection,
  }
}

export default inspectionResolvers
