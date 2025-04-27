import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class GetArticleListDto {
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  current: number;

  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  size: number;

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
  status?: '1' | '2';
}
