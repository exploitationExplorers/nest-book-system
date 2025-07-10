# Nest.js 文件上传接口实现指南

本文档提供了在Nest.js中实现文件上传功能的详细步骤和代码示例。

## 1. 安装必要的依赖

首先，安装以下依赖：

```bash
npm install --save @nestjs/platform-express multer
npm install --save-dev @types/multer
```

## 2. 创建文件实体

创建一个文件实体类，用于存储文件信息：

```typescript
// src/modules/upload/entities/file.entity.ts
import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('file')
export class FileEntity {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalName: string;

  @Column()
  mimeType: string;

  @Column()
  size: number;

  @Column()
  path: string;

  @Column({ nullable: true })
  hash: string;

  @Column()
  uploadBy: string;

  @CreateDateColumn()
  uploadTime: Date;
}
```

## 3. 创建文件上传模块

```typescript
// src/modules/upload/upload.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FileEntity } from './entities/file.entity';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';
import { MulterModule } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';

// 确保上传目录存在
const uploadDir = './uploads';
if (!existsSync(uploadDir)) {
  mkdirSync(uploadDir, { recursive: true });
}

@Module({
  imports: [
    TypeOrmModule.forFeature([FileEntity]),
    MulterModule.register({
      storage: diskStorage({
        destination: './uploads',
        filename: (req, file, callback) => {
          // 生成唯一文件名
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
    }),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
```

## 4. 创建文件上传服务

```typescript
// src/modules/upload/upload.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { FileEntity } from './entities/file.entity';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

@Injectable()
export class UploadService {
  constructor(
    @InjectRepository(FileEntity)
    private fileRepository: Repository<FileEntity>,
  ) {}

  // 保存上传文件信息
  async saveFileInfo(file: Express.Multer.File, userId: string): Promise<FileEntity> {
    // 生成文件哈希值
    const fileBuffer = fs.readFileSync(file.path);
    const fileHash = crypto
      .createHash('md5')
      .update(fileBuffer)
      .digest('hex');
      
    const fileEntity = this.fileRepository.create({
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      path: file.path,
      hash: fileHash,
      uploadBy: userId,
    });
    
    return await this.fileRepository.save(fileEntity);
  }

  // 获取文件列表
  async getFileList(query: any): Promise<{ records: FileEntity[]; total: number }> {
    const { current = 1, size = 10, fileName } = query;
    
    const queryBuilder = this.fileRepository.createQueryBuilder('file');
    
    if (fileName) {
      queryBuilder.andWhere('file.originalName LIKE :fileName', { fileName: `%${fileName}%` });
    }
    
    const total = await queryBuilder.getCount();
    const records = await queryBuilder
      .orderBy('file.uploadTime', 'DESC')
      .skip((current - 1) * size)
      .take(size)
      .getMany();
    
    return { records, total };
  }

  // 获取单个文件
  async getFileById(id: number): Promise<FileEntity> {
    const file = await this.fileRepository.findOne({ where: { id } });
    if (!file) {
      throw new NotFoundException(`文件ID为${id}的文件不存在`);
    }
    return file;
  }

  // 删除文件
  async deleteFile(id: number): Promise<boolean> {
    const file = await this.fileRepository.findOne({ where: { id } });
    
    if (file && fs.existsSync(file.path)) {
      fs.unlinkSync(file.path);
    }
    
    const result = await this.fileRepository.delete(id);
    return result.affected > 0;
  }

  // 批量删除文件
  async batchDeleteFiles(ids: number[]): Promise<boolean> {
    const files = await this.fileRepository.findBy({ id: In(ids) });
    
    for (const file of files) {
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
    
    const result = await this.fileRepository.delete(ids);
    return result.affected > 0;
  }
}
```

## 5. 创建文件上传控制器

```typescript
// src/modules/upload/upload.controller.ts
import { 
  Controller, 
  Post, 
  Get, 
  Delete, 
  Param, 
  Query, 
  Body, 
  UseInterceptors, 
  UploadedFile, 
  Req, 
  Res,
  ParseIntPipe
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Response } from 'express';
import * as path from 'path';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}

  // 文件上传接口
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    // 从请求中获取用户ID，实际项目中应该从JWT或会话中获取
    const userId = req.user?.id || 'anonymous';
    
    const fileInfo = await this.uploadService.saveFileInfo(file, userId);
    
    // 构建文件URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${path.basename(file.path)}`;
    
    return {
      code: '200',
      data: {
        id: fileInfo.id,
        url: fileUrl,
        name: file.originalname
      },
      msg: '上传成功'
    };
  }

  // 获取文件列表
  @Get('list')
  async getFileList(@Query() query) {
    const { records, total } = await this.uploadService.getFileList(query);
    
    // 为每个文件添加URL
    const baseUrl = `http://localhost:3000`; // 根据实际情况修改
    const recordsWithUrl = records.map(record => ({
      ...record,
      url: `${baseUrl}/uploads/${path.basename(record.path)}`
    }));
    
    return {
      code: '200',
      data: {
        records: recordsWithUrl,
        total,
        current: Number(query.current) || 1,
        size: Number(query.size) || 10
      },
      msg: '操作成功'
    };
  }

  // 文件预览/下载
  @Get('preview/:id')
  async previewFile(@Param('id', ParseIntPipe) id: number, @Res() res: Response) {
    const file = await this.uploadService.getFileById(id);
    
    // 设置适当的内容类型
    res.setHeader('Content-Type', file.mimeType);
    
    // 对于图片和PDF等可以直接在浏览器中查看的文件，设置为inline
    const inlineTypes = ['image/', 'application/pdf'];
    const disposition = inlineTypes.some(type => file.mimeType.startsWith(type)) 
      ? 'inline' 
      : 'attachment';
    
    res.setHeader('Content-Disposition', `${disposition}; filename="${encodeURIComponent(file.originalName)}"`);
    
    // 发送文件
    res.sendFile(path.resolve(file.path));
  }

  // 删除文件
  @Delete('delete/:id')
  async deleteFile(@Param('id', ParseIntPipe) id: number) {
    const result = await this.uploadService.deleteFile(id);
    
    return {
      code: '200',
      data: result,
      msg: '删除成功'
    };
  }

  // 批量删除文件
  @Delete('batchDelete')
  async batchDeleteFiles(@Body() body: { ids: number[] }) {
    const result = await this.uploadService.batchDeleteFiles(body.ids);
    
    return {
      code: '200',
      data: result,
      msg: '批量删除成功'
    };
  }
}
```

## 6. 配置静态文件服务

在主模块中配置静态文件服务，使上传的文件可以通过URL访问：

```typescript
// src/app.module.ts
import { Module } from '@nestjs/common';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { UploadModule } from './modules/upload/upload.module';
// 其他导入...

@Module({
  imports: [
    // 其他模块...
    UploadModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'uploads'),
      serveRoot: '/uploads',
    }),
  ],
  // 其他配置...
})
export class AppModule {}
```

## 7. 配置CORS（如果前端和后端在不同域）

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 配置CORS
  app.enableCors({
    origin: true, // 允许所有来源，生产环境应该设置为特定域名
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });
  
  await app.listen(3000);
}
bootstrap();
```

## 8. 数据库迁移

确保在数据库中创建了对应的表：

```sql
CREATE TABLE `file` (
  `id` int NOT NULL AUTO_INCREMENT,
  `originalName` varchar(255) NOT NULL,
  `mimeType` varchar(255) NOT NULL,
  `size` int NOT NULL,
  `path` varchar(255) NOT NULL,
  `hash` varchar(255) DEFAULT NULL,
  `uploadBy` varchar(255) NOT NULL,
  `uploadTime` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

## 9. 测试接口

使用Postman或其他工具测试接口：

1. 上传文件：POST http://localhost:3000/upload/file
   - 使用form-data格式，添加一个名为"file"的文件字段

2. 获取文件列表：GET http://localhost:3000/upload/list?current=1&size=10&fileName=test

3. 预览/下载文件：GET http://localhost:3000/upload/preview/1

4. 删除文件：DELETE http://localhost:3000/upload/delete/1

5. 批量删除文件：DELETE http://localhost:3000/upload/batchDelete
   - 请求体：{ "ids": [1, 2, 3] }

## 10. 注意事项

1. 文件大小限制：默认情况下，Nest.js使用的Express限制上传文件大小为1MB，可以在main.ts中修改：

```typescript
// src/main.ts
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 配置请求体大小限制
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));
  
  // 其他配置...
  
  await app.listen(3000);
}
bootstrap();
```

2. 安全考虑：
   - 验证文件类型和大小
   - 使用防病毒扫描
   - 实施适当的访问控制
   - 考虑使用云存储服务而不是本地存储

3. 性能优化：
   - 对于大文件，考虑实现分片上传
   - 对于图片，可以添加图片处理功能（如生成缩略图）
   - 考虑使用缓存来提高文件访问速度
