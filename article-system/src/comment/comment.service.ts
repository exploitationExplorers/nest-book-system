import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager, InjectRepository } from '@nestjs/typeorm';
import { Between, EntityManager, Like, Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { Article } from '../article/entities/article.entity';
import { CommentSearchDto } from './dto/comment-search.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';

@Injectable()
export class CommentService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
    @InjectRepository(Article)
    private articleRepository: Repository<Article>,
  ) {}

  async getCommentList(query: CommentSearchDto) {
    const { current = 1, size = 10, articleId, content, startTime, endTime, status, userName } = query;

    // 构建查询条件
    const whereConditions: any = {};

    if (articleId) {
      whereConditions.articleId = articleId;
    }

    if (content) {
      whereConditions.content = Like(`%${content}%`);
    }

    if (status) {
      whereConditions.status = status;
    }

    if (userName) {
      whereConditions.userName = Like(`%${userName}%`);
    }

    // 处理时间范围查询
    if (startTime && endTime) {
      whereConditions.createTime = Between(new Date(startTime), new Date(endTime));
    } else if (startTime) {
      whereConditions.createTime = Between(new Date(startTime), new Date());
    }

    // 获取总数
    const total = await this.entityManager.count(Comment, {
      where: whereConditions,
    });

    // 获取分页数据
    const records = await this.entityManager.find(Comment, {
      where: whereConditions,
      skip: (current - 1) * size,
      take: size,
      order: {
        createTime: 'DESC',
      },
    });

    return {
      code: '200',
      data: {
        records,
        total,
        current,
        size,
      },
      msg: '获取评论列表成功',
    };
  }

  async addComment(createCommentDto: CreateCommentDto) {
    // 检查文章是否存在
    const article = await this.articleRepository.findOne({
      where: { id: createCommentDto.articleId },
    });

    if (!article) {
      throw new NotFoundException(`ID为${createCommentDto.articleId}的文章不存在`);
    }

    // 创建评论实体
    const comment = new Comment();
    Object.assign(comment, {
      ...createCommentDto,
      articleTitle: article.title,
      status: '0', // 默认待审核
    });

    // 保存评论
    const savedComment = await this.entityManager.save(Comment, comment);

    return {
      code: '200',
      data: savedComment,
      msg: '添加评论成功',
    };
  }

  async updateComment(updateCommentDto: UpdateCommentDto) {
    const { id, ...updateData } = updateCommentDto;

    // 检查评论是否存在
    const comment = await this.entityManager.findOne(Comment, {
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`ID为${id}的评论不存在`);
    }

    // 更新评论
    await this.entityManager.update(Comment, id, updateData);

    // 获取更新后的评论
    const updatedComment = await this.entityManager.findOne(Comment, {
      where: { id },
    });

    return {
      code: '200',
      data: updatedComment,
      msg: '更新评论成功',
    };
  }

  async deleteComment(id: number) {
    // 检查评论是否存在
    const comment = await this.entityManager.findOne(Comment, {
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`ID为${id}的评论不存在`);
    }

    // 删除评论
    await this.entityManager.delete(Comment, id);

    return {
      code: '200',
      data: null,
      msg: '删除评论成功',
    };
  }

  async getArticleOptions() {
    const articles = await this.articleRepository.find({
      select: ['id', 'title'],
    });

    const options = articles.map(article => ({
      value: article.id,
      label: article.title,
    }));

    return {
      code: '200',
      data: options,
      msg: '获取文章选项成功',
    };
  }

  async auditComment(id: number, status: '0' | '1' | '2') {
    // 检查评论是否存在
    const comment = await this.entityManager.findOne(Comment, {
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException(`ID为${id}的评论不存在`);
    }

    // 更新评论状态
    await this.entityManager.update(Comment, id, { status });

    return {
      code: '200',
      data: null,
      msg: '审核评论成功',
    };
  }
}