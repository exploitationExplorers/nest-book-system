import { Article } from '../entities/article.entity';

export class ArticleResponseDto {
  code: string;
  data: Article;
  msg: string;
}
