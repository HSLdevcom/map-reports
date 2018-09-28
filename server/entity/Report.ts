import {
  Entity,
  Column,
  Index,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm'
import { ReportItem } from './ReportItem'
import { Inspection } from './Inspection'
import { User } from './User'
import { Comment } from './Comment'
import { ReportPriority, ReportStatus } from '../../shared/types/Report'
import {
  Report as ReportType,
  ReportItem as ReportItemType,
} from '../../shared/types/Report'
import { User as UserType } from '../../shared/types/User'
import { Comment as CommentType } from '../../shared/types/Comment'
import { Inspection as InspectionType } from '../../shared/types/Inspection'

@Entity()
export class Report implements ReportType {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column('text', { nullable: true })
  message: string

  @Column('varchar', { length: 20, default: 'NEW' })
  status: ReportStatus

  @Column('varchar', { length: 20, default: 'LOW' })
  priority: ReportPriority

  @OneToOne(type => ReportItem, reportItem => reportItem.report, { cascade: true })
  @JoinColumn()
  item: ReportItemType

  @ManyToOne(type => Inspection, inspection => inspection.reports, { nullable: true })
  inspection: InspectionType

  @ManyToOne(type => User, user => user.reports, { cascade: true })
  reportedBy: UserType

  @OneToMany(type => Comment, comment => comment.report, { cascade: true })
  comments: CommentType[]

  @CreateDateColumn()
  createdAt: string

  @UpdateDateColumn()
  updatedAt: string
}
