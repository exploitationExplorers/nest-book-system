import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Role } from './role.entity';
@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ length: 50, unique: true })
  userName: string;

  @Column({ length: 50, nullable: true })
  nickName: string;

  @Column({ length: 100, nullable: true })
  userEmail: string;

  @Column({ length: 20, nullable: true })
  userPhone: string;

  @Column({ length: 1, nullable: true })
  userGender: string;

  @Column({ length: 1, default: '1' })
  status: string;

  @Column({ length: 50, nullable: true })
  createBy: string;

  @CreateDateColumn()
  createTime: Date;

  @Column({ length: 50, nullable: true })
  updateBy: string;

  @UpdateDateColumn()
  updateTime: Date;
  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_role_relation',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  roles: Role[];
}
