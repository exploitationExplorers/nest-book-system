import { Transform } from 'class-transformer';
import {
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UpdateUserDto {
  @IsNotEmpty({ message: 'ID不能为空' })
  @IsNumber()
  @Transform(({ value }) => parseInt(value, 10))
  id: number;
  @IsNotEmpty({ message: '用户名不能为空' })
  @IsString()
  userName: string;

  @IsOptional()
  @IsString()
  nickName?: string;

  @IsOptional()
  @IsString()
  userPhone?: string;

  @IsOptional()
  @IsString()
  userEmail?: string;

  @IsOptional()
  @IsIn(['1', '2'])
  userGender?: string;

  @IsOptional()
  @IsIn(['1', '2'])
  status?: string;

  @IsOptional()
  // @IsArray()
  roles?: string;
}
