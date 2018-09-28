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

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string

  @Column('varchar', { length: 256 })
  name: string

  @Column('varchar', { length: 256, unique: true })
  email: string

  @Column('text')
  password: string

  @Column('simple-array')
  roles: string[]

  @OneToMany(type => Report, report => report.reportedBy)
  reports: Report[]

  @OneToMany(type => Comment, comment => comment.author)
  comments: Comment[]

  @CreateDateColumn()
  createdAt: string

  @UpdateDateColumn()
  updatedAt: string
}
