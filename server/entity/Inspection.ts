import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm'
import { Report } from './Report'

@Entity()
export class Inspection {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ default: 'cron' })
  type: string

  @Column({ default: 'none', nullable: true })
  datasetType: string

  @Column({ nullable: true })
  datasetUri: string

  @Column({ nullable: true })
  cron: string

  @Column({ nullable: true })
  entityIdentifier: string

  @Column('jsonb', { nullable: true })
  geoJSONProps: string

  @Column('jsonb', { nullable: true })
  geoJSON: string

  @ManyToOne(type => Report, report => report.inspection)
  reports: Report[]

  @CreateDateColumn()
  createdAt: string

  @UpdateDateColumn()
  updatedAt: string
}
