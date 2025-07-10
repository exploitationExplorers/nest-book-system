import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ArticleModule } from './article/article.module';
import { SystemManageModule } from './system-manage/system-manage.module';
import { CommentModule } from './comment/comment.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Article } from './article/entities/article.entity';
import { User } from './system-manage/entities/user.entity';
import { Role } from './system-manage/entities/role.entity';
import { Comment } from './comment/entities/comment.entity';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UploadModule } from './upLoad/upload.module';
import { FileEntity } from './upLoad/entities/file.entity';
import { LoginModule } from './login/login.module';
import { Login } from './login/entities/login.entity';
import { JwtModule } from '@nestjs/jwt';
@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: '106.53.18.43',
      port: 3306,
      username: 'article_system',
      password: 'asd.12345',
      database: 'article_system',
      entities: [Article, User, Role, Comment, FileEntity, Login],
      synchronize: true,
      logging: true,
    }),
    ArticleModule,
    SystemManageModule,
    CommentModule,
    UploadModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
    LoginModule,
    JwtModule.register({
      global: true,
      secret: 'secret',
      signOptions: { expiresIn: '7d' },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
