import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { DataSource, Repository, SelectQueryBuilder } from 'typeorm';
import { isUniqueViolation } from '../common/postgres-errors';
import { ProfilesService } from '../profiles/profiles.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { ArticleFavorite } from './article-favorite.entity';
import { Article } from './article.entity';
import { MAX_SLUG_GENERATION_ATTEMPTS } from './article.constants';
import {
  ArticleDto,
  ArticleResponse,
  ArticlesResponse,
} from './article-response.interface';
import { CreateArticleFieldsDto } from './dto/create-article.dto';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateArticleFieldsDto } from './dto/update-article.dto';
import { generateArticleSlug } from './slug.util';

@Injectable()
export class ArticlesService {
  constructor(
    private readonly usersService: UsersService,
    private readonly profilesService: ProfilesService,
    private readonly i18n: I18nService,
    private readonly dataSource: DataSource,
    @InjectRepository(Article)
    private readonly articlesRepository: Repository<Article>,
    @InjectRepository(ArticleFavorite)
    private readonly favoritesRepository: Repository<ArticleFavorite>,
  ) {}

  async create(
    author: User,
    dto: CreateArticleFieldsDto,
  ): Promise<ArticleResponse> {
    const tagList = [...new Set(dto.tagList ?? [])].sort();
    const article = await this.saveWithUniqueSlug(
      dto.title,
      this.articlesRepository.create({
        title: dto.title,
        description: dto.description,
        body: dto.body,
        tagList,
        authorId: author.id,
      }),
    );

    const [dtoResult] = await this.toDtos([article], author.id);
    return { article: dtoResult };
  }

  async findOne(
    slug: string,
    currentUserId?: number,
  ): Promise<ArticleResponse> {
    const article = await this.findBySlugOrFail(slug);
    const [dtoResult] = await this.toDtos([article], currentUserId);
    return { article: dtoResult };
  }

  async findAll(
    query: ListArticlesQueryDto,
    currentUserId?: number,
  ): Promise<ArticlesResponse> {
    const qb = this.articlesRepository.createQueryBuilder('article');

    if (query.tag) {
      qb.andWhere(':tag = ANY(article.tagList)', { tag: query.tag });
    }
    if (query.author) {
      const author = await this.usersService.findByUsername(query.author);
      qb.andWhere('article.authorId = :authorId', {
        authorId: author?.id ?? -1,
      });
    }
    if (query.favorited) {
      const favoritedBy = await this.usersService.findByUsername(
        query.favorited,
      );
      qb.innerJoin(
        ArticleFavorite,
        'favorite',
        'favorite.articleId = article.id AND favorite.userId = :favoritedById',
        { favoritedById: favoritedBy?.id ?? -1 },
      );
    }

    return this.paginate(qb, query, currentUserId);
  }

  async findFeed(
    currentUserId: number,
    query: PaginationQueryDto,
  ): Promise<ArticlesResponse> {
    const followingIds =
      await this.profilesService.getAllFollowingIds(currentUserId);
    if (!followingIds.size) {
      return { articles: [], articlesCount: 0 };
    }

    const qb = this.articlesRepository
      .createQueryBuilder('article')
      .where('article.authorId IN (:...ids)', { ids: [...followingIds] });

    return this.paginate(qb, query, currentUserId);
  }

  async update(
    currentUser: User,
    slug: string,
    dto: UpdateArticleFieldsDto,
  ): Promise<ArticleResponse> {
    const article = await this.findBySlugOrFail(slug);
    this.assertIsAuthor(currentUser, article);

    if (dto.description !== undefined) article.description = dto.description;
    if (dto.body !== undefined) article.body = dto.body;

    const saved =
      dto.title !== undefined
        ? await this.saveWithUniqueSlug(
            dto.title,
            Object.assign(article, { title: dto.title }),
          )
        : await this.articlesRepository.save(article);

    const [dtoResult] = await this.toDtos([saved], currentUser.id);
    return { article: dtoResult };
  }

  async remove(currentUser: User, slug: string): Promise<void> {
    const article = await this.findBySlugOrFail(slug);
    this.assertIsAuthor(currentUser, article);

    await this.dataSource.transaction(async (manager) => {
      await manager.delete(ArticleFavorite, { articleId: article.id });
      await manager.delete(Article, article.id);
    });
  }

  async favorite(
    currentUserId: number,
    slug: string,
  ): Promise<ArticleResponse> {
    const article = await this.findBySlugOrFail(slug);
    try {
      await this.favoritesRepository.insert({
        userId: currentUserId,
        articleId: article.id,
      });
    } catch (error) {
      if (!isUniqueViolation(error)) throw error;
    }

    const [dtoResult] = await this.toDtos([article], currentUserId);
    return { article: dtoResult };
  }

  async unfavorite(
    currentUserId: number,
    slug: string,
  ): Promise<ArticleResponse> {
    const article = await this.findBySlugOrFail(slug);
    await this.favoritesRepository.delete({
      userId: currentUserId,
      articleId: article.id,
    });

    const [dtoResult] = await this.toDtos([article], currentUserId);
    return { article: dtoResult };
  }

  private async findBySlugOrFail(slug: string): Promise<Article> {
    const article = await this.articlesRepository.findOne({
      where: { slug },
    });
    if (!article) {
      throw new NotFoundException({
        errors: { slug: [this.i18n.t('articles.not_found')] },
      });
    }
    return article;
  }

  private assertIsAuthor(user: User, article: Article): void {
    if (article.authorId !== user.id) {
      throw new ForbiddenException({
        errors: { article: [this.i18n.t('articles.forbidden')] },
      });
    }
  }

  private async saveWithUniqueSlug(
    title: string,
    article: Article,
  ): Promise<Article> {
    for (let attempt = 1; ; attempt++) {
      article.slug = generateArticleSlug(title);
      try {
        return await this.articlesRepository.save(article);
      } catch (error) {
        if (
          attempt >= MAX_SLUG_GENERATION_ATTEMPTS ||
          !isUniqueViolation(error)
        ) {
          throw error;
        }
      }
    }
  }

  private async paginate(
    qb: SelectQueryBuilder<Article>,
    query: PaginationQueryDto,
    currentUserId?: number,
  ): Promise<ArticlesResponse> {
    const [articlesCount, articles] = await Promise.all([
      qb.clone().getCount(),
      qb
        .clone()
        .orderBy('article.createdAt', 'DESC')
        .skip(query.offset)
        .take(query.limit)
        .getMany(),
    ]);

    return {
      articles: await this.toDtos(articles, currentUserId),
      articlesCount,
    };
  }

  private async toDtos(
    articles: Article[],
    currentUserId?: number,
  ): Promise<ArticleDto[]> {
    if (!articles.length) return [];

    const articleIds = articles.map((article) => article.id);
    const authorIds = [...new Set(articles.map((article) => article.authorId))];

    const [authors, favoriteStats, followingIds] = await Promise.all([
      this.usersService.findByIds(authorIds),
      this.getFavoriteStats(articleIds, currentUserId),
      this.profilesService.getFollowingIds(currentUserId, authorIds),
    ]);
    const authorsById = new Map(authors.map((user) => [user.id, user]));

    return articles.flatMap((article) => {
      const author = authorsById.get(article.authorId);
      if (!author) return [];

      const stats = favoriteStats.get(article.id);
      return {
        slug: article.slug,
        title: article.title,
        description: article.description,
        body: article.body,
        tagList: article.tagList,
        createdAt: article.createdAt.toISOString(),
        updatedAt: article.updatedAt.toISOString(),
        favorited: stats?.favorited ?? false,
        favoritesCount: stats?.count ?? 0,
        author: {
          username: author.username,
          bio: author.bio,
          image: author.image,
          following: followingIds.has(author.id),
        },
      };
    });
  }

  private async getFavoriteStats(
    articleIds: number[],
    currentUserId?: number,
  ): Promise<Map<number, { count: number; favorited: boolean }>> {
    if (!articleIds.length) return new Map();

    const rows = await this.favoritesRepository
      .createQueryBuilder('favorite')
      .select('favorite.articleId', 'articleId')
      .addSelect('COUNT(*)', 'count')
      .addSelect(
        currentUserId !== undefined
          ? 'COUNT(*) FILTER (WHERE favorite.userId = :currentUserId)'
          : '0',
        'myCount',
      )
      .where('favorite.articleId IN (:...articleIds)', {
        articleIds,
        ...(currentUserId !== undefined && { currentUserId }),
      })
      .groupBy('favorite.articleId')
      .getRawMany<{ articleId: string; count: string; myCount: string }>();

    return new Map(
      rows.map((row) => [
        Number(row.articleId),
        { count: Number(row.count), favorited: Number(row.myCount) > 0 },
      ]),
    );
  }
}
