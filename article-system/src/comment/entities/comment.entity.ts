import {
  Column,
  CreateDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Article } from '../../article/entities/article.entity';

@Entity()
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  articleId: number;

  @Column({ length: 100 })
  articleTitle: string;

  @Column({ type: 'text', comment: '评论内容' })
  content: string;

  @CreateDateColumn({ comment: '创建时间' })
  createTime: Date;

  @Column({ nullable: true, comment: '回复评论ID' })
  replyId?: number;

  @Column({ nullable: true, length: 500, comment: '回复评论内容' })
  replyContent?: string;

  @Column({ nullable: true, length: 50, comment: '回复评论用户名' })
  replyUserName?: string;

  @Column({
    length: 1,
    default: '0',
    comment: '评论状态：0-待审核 1-已通过 2-已拒绝',
  })
  status: '0' | '1' | '2';

  @Column({ length: 550, comment: '评论者头像', default: '' })
  userAvatar: string;

  @Column({ comment: '评论者ID' })
  userId: number;

  @Column({ length: 50, comment: '评论者名称', default: '' })
  userName: string;

  @ManyToOne(() => Article)
  @JoinColumn({ name: 'articleId' })
  article: Article;
}
