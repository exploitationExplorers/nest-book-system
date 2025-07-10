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
  UploadedFiles,
  Req,
  Res,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { Response } from 'express';
import * as path from 'path';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) {}
  @Get()
  async getInfo() {
    console.log('upload');
    
  }

  @Post('img')
  @UseInterceptors(FileInterceptor('file'))
  async upload(@UploadedFile() file: Express.Multer.File) {
    console.log(file);
    if (!file) {
      throw new BadRequestException('未检测到上传文件');
    }
    // 从请求中获取用户ID，实际项目中应该从JWT或会话中获取
    const userId = 'anonymous'
    const fileInfo = await this.uploadService.saveFileInfo(file, userId);
    // 文件地址
    const baseUrl = 'http://localhost:3001/uploads/';
    const url = `${baseUrl}${file.filename}`;
    return {
      code: 200,
      data: {
        id: fileInfo.id,
        url: url,
        name: file.originalname,
      },
      message: 'File uploaded successfully',
    };
  }
  // 单文件上传接口
  @Post('file')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File, @Req() req) {
    if (!file) {
      throw new BadRequestException('未检测到上传文件');
    }

    // 从请求中获取用户ID，实际项目中应该从JWT或会话中获取
    const userId = req.user?.id || 'anonymous';

    const fileInfo = await this.uploadService.saveFileInfo(file, userId);
    console.log(file, 'file');

    // 构建文件URL
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const fileUrl = `${baseUrl}/uploads/${path.basename(file.path)}`;

    return {
      code: '200',
      data: {
        id: fileInfo.id,
        url: fileUrl,
        name: file.originalname,
      },
      msg: '上传成功',
    };
  }

  // 多文件上传接口
  @Post('files')
  @UseInterceptors(FilesInterceptor('files', 10)) // 最多10个文件
  async uploadFiles(@UploadedFiles() files: Express.Multer.File[], @Req() req) {
    if (!files || files.length === 0) {
      throw new BadRequestException('未检测到上传文件');
    }

    const userId = req.user?.id || 'anonymous';
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    const results = await Promise.all(
      files.map(async (file) => {
        const fileInfo = await this.uploadService.saveFileInfo(file, userId);
        const fileUrl = `${baseUrl}/uploads/${path.basename(file.path)}`;

        return {
          id: fileInfo.id,
          url: fileUrl,
          name: file.originalname,
        };
      }),
    );

    return {
      code: '200',
      data: results,
      msg: '上传成功',
    };
  }

  // 获取文件列表
  @Get('list')
  async getFileList(@Query() query) {
    const { records, total } = await this.uploadService.getFileList(query);

    // 为每个文件添加URL
    const baseUrl = `http://${process.env.HOST || 'localhost'}:${process.env.PORT || 3001}`;
    console.log(records,'records');
    const recordsWithUrl = records.map((record) => ({
      
      ...record,
      url: `${baseUrl}/uploads/${path.basename(record.path)}`,
    }));

    return {
      code: '200',
      data: {
        records: recordsWithUrl,
        total,
        current: Number(query.current) || 1,
        size: Number(query.size) || 10,
      },
      msg: '获取文件列表成功',
    };
  }

  // 文件预览/下载
  @Get('preview/:id')
  async previewFile(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const file = await this.uploadService.getFileById(id);

    // 设置适当的内容类型
    res.setHeader('Content-Type', file.mimeType);

    // 对于图片和PDF等可以直接在浏览器中查看的文件，设置为inline
    const inlineTypes = ['image/', 'application/pdf'];
    const disposition = inlineTypes.some((type) =>
      file.mimeType.startsWith(type),
    )
      ? 'inline'
      : 'attachment';

    res.setHeader(
      'Content-Disposition',
      `${disposition}; filename="${encodeURIComponent(file.originalName)}"`,
    );

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
      msg: '删除成功',
    };
  }

  // 批量删除文件
  @Delete('batchDelete')
  async batchDeleteFiles(@Body() body: { ids: number[] }) {
    const result = await this.uploadService.batchDeleteFiles(body.ids);

    return {
      code: '200',
      data: result,
      msg: '批量删除成功',
    };
  }
}
