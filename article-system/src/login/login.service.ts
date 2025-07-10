import { HttpException, Injectable, Logger } from '@nestjs/common';
import { CreateLoginDto } from './dto/create-login.dto';
import { UpdateLoginDto } from './dto/update-login.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Login } from './entities/login.entity';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import { RegisterDto } from './dto/register.dto';

function md5(str) {
  const hash = crypto.createHash('md5');
  hash.update(str);
  return hash.digest('hex');
}

@Injectable()
export class LoginService {
  private logger = new Logger();
  @InjectRepository(Login)
  private loginRepository: Repository<Login>;
  create(createLoginDto: CreateLoginDto) {
    return 'This action adds a new login';
  }
  async register(user: RegisterDto) {
    const foundUser = await this.loginRepository.findOneBy({
      username: user.username,
    });
    if (foundUser) {
      throw new HttpException('用户已存在', 400);
    }
    const newUser = new Login();
    newUser.username = user.username;
    newUser.password = md5(user.password);
    try {
      await this.loginRepository.save(newUser);
      return {
        code: 200,
        message: '注册成功',
      };
    } catch (error) {
      this.logger.error(error, LoginService);
      return {
        code: 500,
        message: '注册失败',
      };
    }
  }

  async login(user: CreateLoginDto) {
    const foundUser = await this.loginRepository.findOneBy({
      username: user.username,
    });
    if (!foundUser) {
      throw new HttpException('用户名不存在', 200);
    }
    if (foundUser.password !== md5(user.password)) {
      throw new HttpException('密码错误', 200);
    }
    return {
      code: 200,
      message: '登录成功',
      user: foundUser,
    };
  }

  findAll() {
    return `This action returns all login`;
  }

  findOne(id: number) {
    return `This action returns a #${id} login`;
  }

  update(id: number, updateLoginDto: UpdateLoginDto) {
    return `This action updates a #${id} login`;
  }

  remove(id: number) {
    return `This action removes a #${id} login`;
  }
}
