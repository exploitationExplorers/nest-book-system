import { Article } from '../entities/article.entity';

export class ArticleListResponseDto {
  code: string;
  data: {
    current: number;
    records: Article[];
    size: number;
    total: number;
  };
  msg: string;
}
