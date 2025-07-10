import { IsArray, IsIn, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUserDto {
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
