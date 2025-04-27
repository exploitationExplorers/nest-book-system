import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';

@Entity()
export class Article {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 100,
    comment: '文章标题',
  })
  title: string;

  @Column({
    length: 50,
    comment: '作者',
  })
  author: string;

  @Column({
    length: 50,
    comment: '分类',
  })
  category: string;

  @Column({
    type: 'text',
    comment: '内容',
  })
  content: string;

  @Column({
    type: 'simple-array',
    comment: '标签',
  })
  tags: string[];

  @Column({
    length: 1,
    default: '1',
    comment: '状态：1-启用，2-禁用',
  })
  status: '1' | '2';

  @Column({
    length: 50,
    comment: '创建人',
  })
  createBy: string;

  @CreateDateColumn({
    comment: '创建时间',
  })
  createTime: Date;

  @Column({
    length: 50,
    comment: '更新人',
  })
  updateBy: string;

  @UpdateDateColumn({
    comment: '更新时间',
  })
  updateTime: Date;
}
