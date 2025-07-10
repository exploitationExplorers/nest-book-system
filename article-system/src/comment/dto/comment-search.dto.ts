import { IsOptional, IsString, IsNumber } from 'class-validator';
import { Transform } from 'class-transformer';

export class CommentSearchDto {
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  current?: number = 1;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  size?: number = 10;

  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  articleId?: number;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  startTime?: string;

  @IsOptional()
  @IsString()
  endTime?: string;

  @IsOptional()
  @IsString()
  status?: string;

  @IsOptional()
  @IsString()
  userName?: string;
}