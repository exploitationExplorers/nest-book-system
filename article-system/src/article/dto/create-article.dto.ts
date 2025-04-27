import { IsArray, IsIn, IsNotEmpty, IsString } from 'class-validator';

export class CreateArticleDto {
  @IsNotEmpty({ message: '标题不能为空' })
  @IsString()
  title: string;

  @IsNotEmpty({ message: '作者不能为空' })
  @IsString()
  author: string;

  @IsNotEmpty({ message: '分类不能为空' })
  @IsString()
  category: string;

  @IsNotEmpty({ message: '内容不能为空' })
  @IsString()
  content: string;

  @IsArray()
  @IsString({ each: true })
  tags: string[];

  @IsIn(['1', '2'], { message: '状态只能是1或2' })
  status: '1' | '2';
}
