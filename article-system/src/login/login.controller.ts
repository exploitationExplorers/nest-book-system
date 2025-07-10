import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Inject,
  Res,
} from '@nestjs/common';
import { LoginService } from './login.service';
import { CreateLoginDto } from './dto/create-login.dto';
import { UpdateLoginDto } from './dto/update-login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';

@Controller('login')
export class LoginController {
  constructor(private readonly loginService: LoginService) {}
  @Inject(JwtService)
  private jwtService: JwtService;
  @Post('userLogin')
  async login(
    @Body() user: CreateLoginDto,
    @Res({ passthrough: true }) res: Response,
  ) {
    const foundUser = await this.loginService.login(user);
    if (foundUser) {
      const token = this.jwtService.sign({
        id: foundUser.user.id,
        username: foundUser.user.username,
      });
      res.setHeader('token', token);
      return {
        userInfo: foundUser,
        token
      };
    } else {
      return {
        code: 400,
        message: '用户名或密码错误',
      };
    }
  }
  @Post('userRegister')
  async register(@Body() user: RegisterDto) {
    return this.loginService.register(user);
  }
  @Get()
  findAll() {
    return this.loginService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.loginService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLoginDto: UpdateLoginDto) {
    return this.loginService.update(+id, updateLoginDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.loginService.remove(+id);
  }
}
