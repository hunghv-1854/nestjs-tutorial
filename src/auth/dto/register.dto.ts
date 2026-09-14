import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsDefined,
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';
import { PASSWORD_MAX_LENGTH, PASSWORD_MIN_LENGTH } from '../auth.constants';

export class RegisterUserDto {
  @ApiProperty({ example: 'hung' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.is_not_empty') })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  username: string;

  @ApiProperty({ example: 'hung@example.com' })
  @IsNotEmpty({ message: i18nValidationMessage('validation.is_not_empty') })
  @IsEmail({}, { message: i18nValidationMessage('validation.is_email') })
  email: string;

  @ApiProperty({
    example: 'Aa@123456',
    minLength: PASSWORD_MIN_LENGTH,
    maxLength: PASSWORD_MAX_LENGTH,
  })
  @IsNotEmpty({ message: i18nValidationMessage('validation.is_not_empty') })
  @IsString({ message: i18nValidationMessage('validation.is_string') })
  @MinLength(PASSWORD_MIN_LENGTH, {
    message: i18nValidationMessage('validation.min_length'),
  })
  @MaxLength(PASSWORD_MAX_LENGTH, {
    message: i18nValidationMessage('validation.max_length'),
  })
  password: string;
}

export class RegisterDto {
  @ApiProperty({ type: RegisterUserDto })
  @IsDefined({ message: i18nValidationMessage('validation.is_defined') })
  @ValidateNested()
  @Type(() => RegisterUserDto)
  user: RegisterUserDto;
}
