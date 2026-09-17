import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { Repository } from 'typeorm';
import { Article } from '../articles/article.entity';
import { ProfilesService } from '../profiles/profiles.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { Comment } from './comment.entity';
import {
  CommentDto,
  CommentResponse,
  CommentsResponse,
} from './comment-response.interface';
import { CreateCommentFieldsDto } from './dto/create-comment.dto';

@Injectable()
export class CommentsService {
  constructor(
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService,
    private readonly i18n: I18nService,
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(Comment)
    private readonly commentsRepository: Repository<Comment>,
  ) {}

  async create(
    currentUser: User,
    articleSlug: string,
    dto: CreateCommentFieldsDto,
  ): Promise<CommentResponse> {
    const article = await this.findArticleOrFail(articleSlug);

    const comment = await this.commentsRepository.save(
      this.commentsRepository.create({
        body: dto.body,
        articleId: article.id,
        authorId: currentUser.id,
      }),
    );

    const [dtoResult] = await this.toDtos([comment], currentUser.id);
    return { comment: dtoResult };
  }

  async findAllForArticle(
    articleSlug: string,
    currentUserId?: number,
  ): Promise<CommentsResponse> {
    const article = await this.findArticleOrFail(articleSlug);

    const comments = await this.commentsRepository.find({
      where: { articleId: article.id },
      order: { createdAt: 'DESC' },
    });

    return { comments: await this.toDtos(comments, currentUserId) };
  }

  async remove(
    currentUser: User,
    articleSlug: string,
    commentId: number,
  ): Promise<void> {
    const article = await this.findArticleOrFail(articleSlug);
    const comment = await this.commentsRepository.findOne({
      where: { id: commentId, articleId: article.id },
      select: { id: true, authorId: true },
    });
    if (!comment) {
      throw new NotFoundException({
        errors: { comment: [this.i18n.t('comments.not_found')] },
      });
    }
    if (comment.authorId !== currentUser.id) {
      throw new ForbiddenException({
        errors: { comment: [this.i18n.t('comments.forbidden')] },
      });
    }

    await this.commentsRepository.delete(comment.id);
  }

  private async findArticleOrFail(slug: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
      select: { id: true },
    });
    if (!article) {
      throw new NotFoundException({
        errors: { slug: [this.i18n.t('articles.not_found')] },
      });
    }
    return article;
  }

  private async toDtos(
    comments: Comment[],
    currentUserId?: number,
  ): Promise<CommentDto[]> {
    if (!comments.length) return [];

    const authorIds = [...new Set(comments.map((comment) => comment.authorId))];
    const [authors, followingIds] = await Promise.all([
      this.usersService.findByIds(authorIds),
      this.profilesService.getFollowingIds(currentUserId, authorIds),
    ]);
    const authorsById = new Map(authors.map((user) => [user.id, user]));

    return comments.map((comment) => {
      const author = authorsById.get(comment.authorId);
      if (!author) {
        throw new NotFoundException({
          errors: { comment: [this.i18n.t('comments.not_found')] },
        });
      }
      return {
        id: comment.id,
        createdAt: comment.createdAt.toISOString(),
        updatedAt: comment.updatedAt.toISOString(),
        body: comment.body,
        author: {
          username: author.username,
          bio: author.bio,
          image: author.image,
          following: followingIds.has(author.id),
        },
      };
    });
  }
}
