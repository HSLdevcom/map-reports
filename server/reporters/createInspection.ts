enum InspectionType {
  CRON = 'cron',
  ONETIME = 'one-time',
  MANUAL = 'manual',
}

enum DatasetType {
  GEOJSON = 'geojson',
  CSV = 'csv',
}

interface InspectionSpec {
  name: string
  type: InspectionType
  datasetType: DatasetType
  datasetUri?: string
  cron?: string
  convertData?: string
}

function createInspection(inspectionSpec: InspectionSpec) {}
