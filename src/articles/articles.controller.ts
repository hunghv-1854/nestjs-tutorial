import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  CurrentUser,
  OptionalCurrentUser,
} from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import type { User } from '../users/user.entity';
import {
  ArticleResponse,
  ArticlesResponse,
} from './article-response.interface';
import { ArticlesService } from './articles.service';
import { CreateArticleDto } from './dto/create-article.dto';
import { ListArticlesQueryDto } from './dto/list-articles-query.dto';
import { PaginationQueryDto } from './dto/pagination-query.dto';
import { UpdateArticleDto } from './dto/update-article.dto';

@ApiTags('articles')
@Controller('articles')
export class ArticlesController {
  constructor(private readonly articlesService: ArticlesService) {}

  @ApiOperation({ summary: 'Create an article' })
  @ApiSecurity('token')
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: User,
    @Body() dto: CreateArticleDto,
  ): Promise<ArticleResponse> {
    return this.articlesService.create(user, dto.article);
  }

  @ApiOperation({ summary: 'List articles from users you follow' })
  @ApiSecurity('token')
  @Get('feed')
  @UseGuards(JwtAuthGuard)
  getFeed(
    @CurrentUser() user: User,
    @Query() query: PaginationQueryDto,
  ): Promise<ArticlesResponse> {
    return this.articlesService.findFeed(user.id, query);
  }

  @ApiOperation({ summary: 'List articles, optionally filtered' })
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  list(
    @Query() query: ListArticlesQueryDto,
    @OptionalCurrentUser() user?: User,
  ): Promise<ArticlesResponse> {
    return this.articlesService.findAll(query, user?.id);
  }

  @ApiOperation({ summary: 'Get an article by slug' })
  @Get(':slug')
  @UseGuards(OptionalJwtAuthGuard)
  getOne(
    @Param('slug') slug: string,
    @OptionalCurrentUser() user?: User,
  ): Promise<ArticleResponse> {
    return this.articlesService.findOne(slug, user?.id);
  }

  @ApiOperation({ summary: "Update the current user's article" })
  @ApiSecurity('token')
  @Put(':slug')
  @UseGuards(JwtAuthGuard)
  update(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Body() dto: UpdateArticleDto,
  ): Promise<ArticleResponse> {
    return this.articlesService.update(user, slug, dto.article);
  }

  @ApiOperation({ summary: "Delete the current user's article" })
  @ApiSecurity('token')
  @Delete(':slug')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  remove(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
  ): Promise<void> {
    return this.articlesService.remove(user, slug);
  }

  @ApiOperation({ summary: 'Favorite an article' })
  @ApiSecurity('token')
  @Post(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  favorite(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
  ): Promise<ArticleResponse> {
    return this.articlesService.favorite(user.id, slug);
  }

  @ApiOperation({ summary: 'Unfavorite an article' })
  @ApiSecurity('token')
  @Delete(':slug/favorite')
  @UseGuards(JwtAuthGuard)
  unfavorite(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
  ): Promise<ArticleResponse> {
    return this.articlesService.unfavorite(user.id, slug);
  }
}
