import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class UpdateCommentDto {
  @IsNotEmpty({ message: '评论ID不能为空' })
  @IsNumber()
  id: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  status?: '0' | '1' | '2';

  @IsOptional()
  @IsNumber()
  replyId?: number;

  @IsOptional()
  @IsString()
  replyContent?: string;
  
  @IsOptional()
  @IsString()
  replyUserName?: string;
}