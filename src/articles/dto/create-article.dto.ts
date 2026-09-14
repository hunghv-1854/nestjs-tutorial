import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsArray,
  IsDefined,
  IsNotEmpty,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class CreateArticleFieldsDto {
  @ApiProperty({ example: 'How to train your dragon' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.is_not_empty') })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  title: string;

  @ApiProperty({ example: 'Ever wonder how?' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.is_not_empty') })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  description: string;

  @ApiProperty({ example: 'It takes a Jacobian' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.is_not_empty') })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  body: string;

  @ApiPropertyOptional({ type: [String], example: ['dragons', 'training'] })
  @IsOptional()
  @IsArray({ message: i18nValidationMessage('validation.is_array') })
  @IsString({
    each: true,
    message: i18nValidationMessage('validation.is_string'),
  })
  tagList?: string[];
}

export class CreateArticleDto {
  @ApiProperty({ type: CreateArticleFieldsDto })
  @IsDefined({ message: i18nValidationMessage('validation.is_defined') })
  @ValidateNested()
  @Type(() => CreateArticleFieldsDto)
  article: CreateArticleFieldsDto;
}
