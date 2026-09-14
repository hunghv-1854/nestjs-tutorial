import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsString, ValidateNested } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateArticleFieldsDto {
  @ApiPropertyOptional({ example: 'How to train your dragon' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  title?: string;

  @ApiPropertyOptional({ example: 'Ever wonder how?' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  description?: string;

  @ApiPropertyOptional({ example: 'It takes a Jacobian' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  body?: string;
}

export class UpdateArticleDto {
  @ApiPropertyOptional({ type: UpdateArticleFieldsDto })
  @ValidateNested()
  @Type(() => UpdateArticleFieldsDto)
  article: UpdateArticleFieldsDto;
}
