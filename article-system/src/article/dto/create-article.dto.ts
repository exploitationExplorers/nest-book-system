import { IsArray, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty({ message: '标题不能为空' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: '作者不能为空' })
  @IsString()
  author: string;

  @IsArray()
  @IsString({ each: true })
  category: string[];

  @IsNotEmpty({ message: '内容不能为空' })
  @IsString()
  content: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];
  @IsString()
  status: '1' | '2';
}
