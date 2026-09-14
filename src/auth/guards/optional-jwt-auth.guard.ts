import {
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import type { User } from '../../users/user.entity';
import { extractJwtFromAuthHeader } from '../auth.constants';

@Injectable()
export class OptionalJwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = User | undefined>(
    err: unknown,
    user: User | false,
    _info: unknown,
    context: ExecutionContext,
  ): TUser {
    const request = context.switchToHttp().getRequest<Request>();
    const hadToken = Boolean(extractJwtFromAuthHeader(request));

    if (!hadToken) {
      return undefined as TUser;
    }
    if (err || !user) {
      throw err instanceof Error ? err : new UnauthorizedException();
    }
    return user as TUser;
  }
}
