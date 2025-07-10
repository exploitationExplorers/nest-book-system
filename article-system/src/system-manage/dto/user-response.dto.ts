import { User } from '../entities/user.entity';

export class UserResponseDto {
  code: string;
  data: {
    current: number;
    records: User[];
    size: number;
    total: number;
  };
  msg: string;
}
