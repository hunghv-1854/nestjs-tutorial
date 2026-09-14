import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsOptional, Max, Min } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { DEFAULT_PAGE_LIMIT, MAX_PAGE_LIMIT } from '../article.constants';

export class PaginationQueryDto {
  @ApiPropertyOptional({ default: DEFAULT_PAGE_LIMIT })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.is_int') })
  @Min(1, { message: i18nValidationMessage('validation.min') })
  @Max(MAX_PAGE_LIMIT, { message: i18nValidationMessage('validation.max') })
  limit: number = DEFAULT_PAGE_LIMIT;

  @ApiPropertyOptional({ default: 0 })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: i18nValidationMessage('validation.is_int') })
  @Min(0, { message: i18nValidationMessage('validation.min') })
  offset: number = 0;
}
