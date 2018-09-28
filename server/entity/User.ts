import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm'
import { Report } from './Report'
import { Comment } from './Comment'
import { User as UserType } from '../../shared/types/User'
import { Report as ReportType } from '../../shared/types/Report'
import { Comment as CommentType } from '../../shared/types/Comment'

@Entity()
export class User implements UserType {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('varchar', { length: 256 })
  name: string

  @Column('varchar', { length: 256, unique: true })
  email: string

  @Column('text', { select: false })
  password: string

  @Column('simple-array')
  roles: string[]

  @OneToMany(type => Report, report => report.reportedBy)
  reports: ReportType[]

  @OneToMany(type => Comment, comment => comment.author)
  comments: CommentType[]

  @CreateDateColumn()
  createdAt: string

  @UpdateDateColumn()
  updatedAt: string
}
