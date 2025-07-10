import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

@Entity('role')
export class Role {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  roleCode: string;

  @Column({ length: 50 })
  roleName: string;

  @Column({ length: 200, nullable: true })
  roleDesc: string;

  @Column({ length: 1, default: '1'})
  status: string;

  @Column({ length: 50, nullable: true })
  createBy: string;

  @CreateDateColumn()
  createTime: Date;

  @Column({ length: 50, nullable: true })
  updateBy: string;

  @UpdateDateColumn()
  updateTime: Date;

  @ManyToMany(() => User, (user) => user.roles)
  users: User[];
}
