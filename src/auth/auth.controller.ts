import {
  Body,
  Controller,
  Get,
  HttpCode,
  ParseFilePipeBuilder,
  Post,
  Put,
  UnauthorizedException,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import {
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import type { User } from '../users/user.entity';
import { UpdateUserDto } from '../users/dto/update-user.dto';
import { UsersService } from '../users/users.service';
import { avatarUploadOptions } from './avatar-upload.options';
import { AuthService } from './auth.service';
import type { UserResponse } from './auth.types';
import { AuthToken } from './decorators/auth-token.decorator';
import { CurrentUser } from './decorators/current-user.decorator';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller()
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @ApiOperation({ summary: 'Register a new user' })
  @Post('users')
  register(@Body() dto: RegisterDto): Promise<UserResponse> {
    return this.authService.register(dto);
  }

  @ApiOperation({ summary: 'Log in with email and password' })
  @Post('users/login')
  @HttpCode(200)
  login(@Body() dto: LoginDto): Promise<UserResponse> {
    return this.authService.login(dto);
  }

  @ApiOperation({ summary: 'Get the currently authenticated user' })
  @ApiSecurity('token')
  @Get('user')
  @UseGuards(JwtAuthGuard)
  getCurrentUser(@CurrentUser() user: User): UserResponse {
    return this.authService.buildUserResponse(user);
  }

  @ApiOperation({ summary: 'Update the current user' })
  @ApiSecurity('token')
  @Put('user')
  @UseGuards(JwtAuthGuard)
  async updateUser(
    @CurrentUser() user: User,
    @Body() dto: UpdateUserDto,
  ): Promise<UserResponse> {
    const updated = await this.usersService.updateProfile(user, dto.user);
    return this.authService.buildUserResponse(updated);
  }

  @ApiOperation({ summary: "Upload the current user's avatar" })
  @ApiSecurity('token')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: { avatar: { type: 'string', format: 'binary' } },
    },
  })
  @Post('user/avatar')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar', avatarUploadOptions))
  async updateAvatar(
    @CurrentUser() user: User,
    @UploadedFile(new ParseFilePipeBuilder().build({ fileIsRequired: true }))
    file: Express.Multer.File,
  ): Promise<UserResponse> {
    const updated = await this.usersService.updateAvatar(user, file);
    return this.authService.buildUserResponse(updated);
  }

  @ApiOperation({ summary: 'Log out the current session' })
  @ApiSecurity('token')
  @Post('user/logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(204)
  logout(@AuthToken() token: string | null): Promise<void> {
    if (!token) {
      throw new UnauthorizedException();
    }
    return this.authService.logout(token);
  }
}
