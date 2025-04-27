import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { ArticleService } from './article.service';
import { GetArticleListDto } from './dto/get-article-list.dto';
import { ArticleListResponseDto } from './dto/article-list-response.dto';
import { CreateArticleDto } from './dto/create-article.dto';
import { UpdateArticleDto } from './dto/update-article.dto';
import { ArticleResponseDto } from './dto/article-response.dto';

@Controller('article')
export class ArticleController {
  constructor(private readonly articleService: ArticleService) {}

  @Get('getArticleList')
  async getArticleList(
    @Query() query: GetArticleListDto,
  ): Promise<ArticleListResponseDto> {
    return this.articleService.getArticleList(query);
  }

  @Post('addArticle')
  async addArticle(
    @Body() createArticleDto: CreateArticleDto,
  ): Promise<ArticleResponseDto> {
    return this.articleService.addArticle(createArticleDto);
  }

  @Put('updateArticle')
  async updateArticle(
    @Body() updateArticleDto: UpdateArticleDto,
  ): Promise<ArticleResponseDto> {
    return this.articleService.updateArticle(updateArticleDto);
  }

  @Delete('deleteArticle/:id')
  async deleteArticle(@Param('id') id: string): Promise<ArticleResponseDto> {
    return this.articleService.deleteArticle(+id);
  }

  @Get('getArticleDetail/:id')
  async getArticleDetail(@Param('id') id: string): Promise<ArticleResponseDto> {
    return this.articleService.getArticleDetail(+id);
  }
  @Get('getCategories')
  async getCategories() {
    return this.articleService.getCategories();
  }
}
