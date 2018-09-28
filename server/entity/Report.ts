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

@Entity()
export class Report {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column()
  title: string

  @Column('varchar', { length: 20, default: 'NEW' })
  status: string

  @Column('varchar', { length: 20, default: 'LOW' })
  priority: string

  @OneToOne(type => ReportItem, reportItem => reportItem.report, { cascade: true })
  @JoinColumn()
  item: ReportItem

  @ManyToOne(type => Inspection, inspection => inspection.reports)
  inspection: Inspection

  @ManyToOne(type => User, user => user.reports, { cascade: true })
  reportedBy: User

  @OneToMany(type => Comment, comment => comment.report, { cascade: true })
  comments: Comment[]

  @CreateDateColumn()
  createdAt: string

  @UpdateDateColumn()
  updatedAt: string
}
