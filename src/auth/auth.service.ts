import {
  Injectable,
  UnauthorizedException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomUUID } from 'crypto';
import { I18nService } from 'nestjs-i18n';
import { RedisService } from '../redis/redis.service';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { PASSWORD_SALT_ROUNDS } from './auth.constants';
import { JwtPayload, UserResponse } from './auth.types';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly i18n: I18nService,
    private readonly redisService: RedisService,
  ) {}

  async register({ user }: RegisterDto): Promise<UserResponse> {
    await this.assertEmailAndUsernameAreFree(user.email, user.username);

    const created = await this.usersService.create({
      username: user.username,
      email: user.email,
      password: await this.hashPassword(user.password),
    });
    return this.buildUserResponse(created);
  }

  async login({ user }: LoginDto): Promise<UserResponse> {
    const existing = await this.usersService.findByEmail(user.email);
    if (!existing) {
      throw new UnauthorizedException({
        errors: { email: [this.i18n.t('auth.email_not_found')] },
      });
    }

    const passwordMatches = await bcrypt.compare(
      user.password,
      existing.password,
    );
    if (!passwordMatches) {
      throw new UnauthorizedException({
        errors: { password: [this.i18n.t('auth.invalid_password')] },
      });
    }

    return this.buildUserResponse(existing);
  }

  async logout(token: string): Promise<void> {
    const payload = this.jwtService.decode<JwtPayload>(token);
    if (!payload?.exp) return;

    const secondsUntilExpiry = payload.exp - Math.floor(Date.now() / 1000);
    await this.redisService.blacklistToken(payload.jti, secondsUntilExpiry);
  }

  buildUserResponse(user: User): UserResponse {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      jti: randomUUID(),
    };
    return {
      user: {
        email: user.email,
        token: this.jwtService.sign(payload),
        username: user.username,
        bio: user.bio,
        image: user.image,
      },
    };
  }

  private async assertEmailAndUsernameAreFree(
    email: string,
    username: string,
  ): Promise<void> {
    const { emailTaken, usernameTaken } =
      await this.usersService.findTakenFields(email, username);

    const errors: Record<string, string[]> = {};
    if (emailTaken) errors.email = [this.i18n.t('auth.email_taken')];
    if (usernameTaken) errors.username = [this.i18n.t('auth.username_taken')];

    if (Object.keys(errors).length) {
      throw new UnprocessableEntityException({ errors });
    }
  }

  private hashPassword(plain: string): Promise<string> {
    return bcrypt.hash(plain, PASSWORD_SALT_ROUNDS);
  }
}
