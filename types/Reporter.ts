import { ScheduledTask, schedule } from 'node-cron'

export interface ReporterMeta {
  id?: string
  name: string
  type: string
  geoJSON?: string
}

export interface Reporter {
  meta: ReporterMeta
  run: () => void
  schedule: (
    scheduler: typeof schedule,
  ) => ScheduledTask | boolean
}
