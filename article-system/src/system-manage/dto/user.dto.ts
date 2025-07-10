import { IsNumber, IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class UserSearchDto {
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  current?: number;
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  size?: number;
  @IsOptional()
  @IsString()
  nickName?: string;
  @IsOptional()
  @IsString()
  status?: string;
  @IsOptional()
  @IsString()
  userEmail?: string;
  @IsOptional()
  @IsString()
  userGender?: string;
  @IsOptional()
  @IsString()
  userName?: string;
  @IsOptional()
  @IsString()
  userPhone?: string;
}
