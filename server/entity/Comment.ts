import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
} from 'typeorm'
import { User } from './User'
import { Report } from './Report'
import { Comment as CommentType } from '../../shared/types/Comment'
import { Report as ReportType } from '../../shared/types/Report'
import { User as UserType } from '../../shared/types/User'

@Entity()
export class Comment implements CommentType {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text')
  body: string

  @ManyToOne(type => Report, report => report.comments, { eager: true })
  report: ReportType

  @ManyToOne(type => User, user => user.comments, { eager: true })
  author: UserType

  @CreateDateColumn()
  createdAt: string

  @UpdateDateColumn()
  updatedAt: string
}
