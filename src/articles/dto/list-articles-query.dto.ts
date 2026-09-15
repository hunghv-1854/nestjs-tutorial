import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PaginationQueryDto } from './pagination-query.dto';

export class ListArticlesQueryDto extends PaginationQueryDto {
  @ApiPropertyOptional({ description: 'Filter by tag' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  tag?: string;

  @ApiPropertyOptional({ description: "Filter by author's username" })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  author?: string;

  @ApiPropertyOptional({
    description: 'Filter by the username of someone who favorited the article',
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  favorited?: string;
}
