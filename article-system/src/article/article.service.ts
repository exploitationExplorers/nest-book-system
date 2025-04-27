import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { EntityManager, Like } from 'typeorm';
import { Article } from './entities/article.entity';
import { GetArticleListDto } from './dto/get-article-list.dto';
import { ArticleListResponseDto } from './dto/article-list-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleResponseDto } from './dto/article-response.dto';

@Injectable()
export class ArticleService {
  constructor(
    @InjectEntityManager()
    private entityManager: EntityManager,
  ) {}

  async getArticleList(
    query: GetArticleListDto,
  ): Promise<ArticleListResponseDto> {
    console.log('xxx');

    const { current, size, title, author, category, status } = query;

    // Build where conditions
    const whereConditions: any = {};

    if (title) {
      whereConditions.title = Like(`%${title}%`);
    }

    if (author) {
      whereConditions.author = Like(`%${author}%`);
    }

    if (category) {
      whereConditions.category = Like(`%${category}%`);
    }

    if (status) {
      whereConditions.status = status;
    }

    // Get total count
    const total = await this.entityManager.count(Article, {
      where: whereConditions,
    });

    // Get paginated records
    const records = await this.entityManager.find(Article, {
      where: whereConditions,
      skip: (current - 1) * size,
      take: size,
      order: {
        createTime: 'DESC',
      },
    });

    // Return formatted response
    return {
      code: '200',
      data: {
        current,
        records,
        size,
        total,
      },
      msg: '获取文章列表成功',
    };
  }

  async addArticle(
    createArticleDto: CreateArticleDto,
  ): Promise<ArticleResponseDto> {
    const { title, author, category, content, tags, status } = createArticleDto;

    // Create new article entity
    const article = new Article();
    article.title = title;
    article.author = author;
    article.category = category;
    article.content = content;
    article.tags = tags;
    article.status = status;
    article.createBy = author; // Using author as createBy for simplicity
    article.updateBy = author; // Using author as updateBy for simplicity

    // Save to database
    console.log('addd');
    
    const savedArticle = await this.entityManager.save(Article, article);

    return {
      code: '200',
      data: savedArticle,
      msg: '添加文章成功',
    };
  }

  async updateArticle(
    updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    const { id, ...updateData } = updateArticleDto;

    // Check if article exists
    const article = await this.entityManager.findOne(Article, {
      where: { id },
    });

    if (!article) {
      throw new NotFoundException(`ID为${id}的文章不存在`);
    }

    // Update article
    await this.entityManager.update(Article, id, {
      ...updateData,
      updateBy: updateData.author || article.updateBy, // Update the updateBy field
    });

    // Get updated article
    const updatedArticle = await this.entityManager.findOne(Article, {
      where: { id },
    });

    return {
      code: '200',
      data: updatedArticle,
      msg: '更新文章成功',
    };
  }

  async deleteArticle(id: number): Promise<ArticleResponseDto> {
    // Check if article exists
    const article = await this.entityManager.findOne(Article, {
      where: { id },
    });

    if (!article) {
      throw new NotFoundException(`ID为${id}的文章不存在`);
    }

    // Delete article
    await this.entityManager.delete(Article, id);

    return {
      code: '200',
      data: article,
      msg: '删除文章成功',
    };
  }

  async getArticleDetail(id: number): Promise<ArticleResponseDto> {
    // Find article by id
    const article = await this.entityManager.findOne(Article, {
      where: { id },
    });

    if (!article) {
      throw new NotFoundException(`ID为${id}的文章不存在`);
    }

    return {
      code: '200',
      data: article,
      msg: '获取文章详情成功',
    };
  }

  async getCategories() {
    // 预定义的分类列表
    const categories = [
      { value: 1, label: '前端技术' },
      { value: 2, label: '后端技术' },
      { value: 3, label: '移动开发' },
      { value: 4, label: '数据库' },
      { value: 5, label: '云计算' },
      { value: 6, label: '人工智能' },
      { value: 7, label: '区块链' },
      { value: 8, label: '其他' },
    ];

    return {
      code: '200',
      data: categories,
      msg: '获取分类列表成功',
    };
  }
}
