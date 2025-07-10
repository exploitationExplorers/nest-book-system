import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('FileEntity')
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  path: string;

  @Column({ nullable: true })
  hash: string;

  @Column({ default: 'anonymous' })
  uploadBy: string;

  @CreateDateColumn()
  uploadTime: Date;
}
