import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm'
import {
  DatasetType,
  Inspection as InspectionInterface,
  InspectionType,
} from '../../shared/types/Inspection'

@Entity()
export class Inspection implements InspectionInterface {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  name: string

  @Column({ default: 'cron' })
  type: InspectionType

  @Column({ default: 'none', nullable: true })
  datasetType: DatasetType

  @Column({ nullable: true })
  datasetUri: string

  @Column({ nullable: true })
  cron: string

  @Column({ nullable: true })
  entityIdentifier: string

  @Column('jsonb', { nullable: true })
  geoJSONProps: any

  @Column('jsonb', { nullable: true })
  geoJSON: any

  @CreateDateColumn()
  createdAt: string

  @UpdateDateColumn()
  updatedAt: string
}
