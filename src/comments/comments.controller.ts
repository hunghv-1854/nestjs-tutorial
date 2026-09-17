import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  ParseIntPipe,
  Post,
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
  CommentResponse,
  CommentsResponse,
} from './comment-response.interface';
import { CommentsService } from './comments.service';
import { CreateCommentDto } from './dto/create-comment.dto';

@ApiTags('comments')
@Controller('articles/:slug/comments')
export class CommentsController {
  constructor(private readonly commentsService: CommentsService) {}

  @ApiOperation({ summary: 'Add a comment to an article' })
  @ApiSecurity('token')
  @Post()
  @UseGuards(JwtAuthGuard)
  create(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Body() dto: CreateCommentDto,
  ): Promise<CommentResponse> {
    return this.commentsService.create(user, slug, dto.comment);
  }

  @ApiOperation({ summary: 'Get the comments for an article' })
  @Get()
  @UseGuards(OptionalJwtAuthGuard)
  findAll(
    @Param('slug') slug: string,
    @OptionalCurrentUser() user?: User,
  ): Promise<CommentsResponse> {
    return this.commentsService.findAllForArticle(slug, user?.id);
  }

  @ApiOperation({ summary: "Delete the current user's comment" })
  @ApiSecurity('token')
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  remove(
    @CurrentUser() user: User,
    @Param('slug') slug: string,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<void> {
    return this.commentsService.remove(user, slug, id);
  }
}
