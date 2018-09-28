import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
} from 'typeorm'
import { Report } from './Report'
import { ReportItem as ReportItemType } from '../../shared/types/Report'

@Entity()
export class ReportItem implements ReportItemType {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('float')
  lat: number

  @Column('float')
  lon: number

  @Column()
  type: string

  @Column()
  @Index('entities')
  entityIdentifier: string

  @Column('jsonb', { nullable: true })
  data: any

  @Column('int', { nullable: true, default: 16 })
  recommendedMapZoom: number

  @OneToOne(type => Report, report => report.item)
  report: Report

  @CreateDateColumn()
  createdAt: string

  @UpdateDateColumn()
  updatedAt: string
}
