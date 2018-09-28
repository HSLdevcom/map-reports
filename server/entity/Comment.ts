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

@Entity()
export class Comment {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('text')
  body: string

  @ManyToOne(type => Report, report => report.comments)
  report: Report

  @ManyToOne(type => User, user => user.comments, { cascade: true })
  author: User

  @CreateDateColumn()
  createdAt: string

  @UpdateDateColumn()
  updatedAt: string
}
