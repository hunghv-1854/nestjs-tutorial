import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../users.constants';

export class UpdateUserFieldsDto {
  @ApiPropertyOptional({ example: 'hung' })
  @IsOptional()
  @IsNotEmpty({ message: i18nValidationMessage('validation.is_not_empty') })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  username?: string;

  @ApiPropertyOptional({ example: 'hung@example.com' })
  @IsOptional()
  @IsNotEmpty({ message: i18nValidationMessage('validation.is_not_empty') })
  @IsEmail({}, { message: i18nValidationMessage('validation.is_email') })
  email?: string;

  @ApiPropertyOptional({
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: i18nValidationMessage('validation.min_length'),
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: i18nValidationMessage('validation.max_length'),
  })
  password?: string;

  @ApiPropertyOptional({ example: 'I like NestJS' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  bio?: string;

  @ApiPropertyOptional({ example: 'https://example.com/avatar.png' })
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  image?: string;
}

export class UpdateUserDto {
  @ApiPropertyOptional({ type: UpdateUserFieldsDto })
  @ValidateNested()
  @Type(() => UpdateUserFieldsDto)
  user: UpdateUserFieldsDto;
}
