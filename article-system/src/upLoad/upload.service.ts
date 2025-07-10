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
  async saveFileInfo(
    file: Express.Multer.File,
    userId: string = 'anonymous',
  ): Promise<FileEntity> {
    // 生成文件哈希值
    const fileBuffer = fs.readFileSync(file.path);
    const fileHash = crypto.createHash('md5').update(fileBuffer).digest('hex');

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
  async getFileList(
    query: any,
  ): Promise<{ records: FileEntity[]; total: number }> {
    const { current = 1, size = 10, fileName } = query;

    const queryBuilder = this.fileRepository.createQueryBuilder('file');

    if (fileName) {
      queryBuilder.andWhere('file.originalName LIKE :fileName', {
        fileName: `%${fileName}%`,
      });
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
