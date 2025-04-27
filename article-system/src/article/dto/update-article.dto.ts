import { IsArray, IsIn, IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UpdateArticleDto {
  @IsNotEmpty({ message: 'ID不能为空' })
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  id: number;

  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsString()
  category?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsIn(['1', '2'], { message: '状态只能是1或2' })
  status?: '1' | '2';
}
