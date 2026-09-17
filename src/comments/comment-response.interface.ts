import { ArticleAuthorDto } from '../articles/article-response.interface';

export interface CommentDto {
  id: number;
  createdAt: string;
  updatedAt: string;
  body: string;
  author: ArticleAuthorDto;
}

export interface CommentResponse {
  comment: CommentDto;
}

export interface CommentsResponse {
  comments: CommentDto[];
}
