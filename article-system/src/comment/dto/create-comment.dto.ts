import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class CreateCommentDto {
  @IsNotEmpty({ message: '文章ID不能为空' })
  @IsNumber()
  articleId: number;

  @IsNotEmpty({ message: '评论内容不能为空' })
  @IsString()
  content: string;

  @IsOptional()
  @IsNumber()
  replyId?: number;

  @IsOptional()
  @IsString()
  replyContent?: string;

  @IsOptional()
  @IsString()
  replyUserName?: string;

  @IsNotEmpty({ message: '用户ID不能为空' })
  @IsNumber()
  userId: number;
  @IsOptional()
  userName: string;
  @IsOptional()
  status?: string;
  // 默认值
  @IsOptional()
  userAvatar: string;
}
