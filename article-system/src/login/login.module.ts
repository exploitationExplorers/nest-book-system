import { Module } from '@nestjs/common';
import { LoginService } from './login.service';
import { LoginController } from './login.controller';
import { Login } from './entities/login.entity';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([Login])],
  controllers: [LoginController],
  providers: [LoginService],
})
export class LoginModule {}
