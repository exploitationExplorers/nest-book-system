import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';

declare module 'express' {
  interface Request {
    user: {
      id: number;
      username: string;
    };
  }
}

@Injectable()
export class LoginGuard implements CanActivate {
  @Inject(JwtService)
  private jwtService: JwtService;
  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const request: Request = context.switchToHttp().getRequest();

    const authorization = request.header('authorization') || '';

    const bearer = authorization.split(' ');
    if (!bearer || bearer.length < 2) {
      throw new UnauthorizedException('登录 token 错误');
    }
    const token = bearer[1];
    try {
      const data = this.jwtService.verify(token);
      request.user = data;
      return true;
    } catch (e) {
      throw new UnauthorizedException('登录 token 错误');
    }
  }
}
