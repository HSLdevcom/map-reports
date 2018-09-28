import { Report } from './Report'

export enum InspectionType {
  CRON = 'cron',
  ONETIME = 'onetime',
  MANUAL = 'manual',
}

export enum DatasetType {
  GEOJSON = 'geojson',
  CSV = 'csv',
  NONE = 'none',
}

export interface Inspection {
  id: string
  name: string
  type: InspectionType
  datasetType?: DatasetType
  datasetUri?: string
  cron?: string
  entityIdentifier?: string
  geoJSONProps?: any
  geoJSON?: any
}
