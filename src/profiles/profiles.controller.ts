import {
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiOperation, ApiSecurity, ApiTags } from '@nestjs/swagger';
import {
  OptionalCurrentUser,
  CurrentUser,
} from '../auth/decorators/current-user.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import type { User } from '../users/user.entity';
import { ProfileResponse } from './profile-response.interface';
import { ProfilesService } from './profiles.service';

@ApiTags('profiles')
@Controller('profiles')
export class ProfilesController {
  constructor(private readonly profilesService: ProfilesService) {}

  @ApiOperation({ summary: "Get a user's profile" })
  @Get(':username')
  @UseGuards(OptionalJwtAuthGuard)
  getProfile(
    @Param('username') username: string,
    @OptionalCurrentUser() currentUser?: User,
  ): Promise<ProfileResponse> {
    return this.profilesService.getProfile(username, currentUser?.id);
  }

  @ApiOperation({ summary: 'Follow a user' })
  @ApiSecurity('token')
  @Post(':username/follow')
  @UseGuards(JwtAuthGuard)
  follow(
    @CurrentUser() currentUser: User,
    @Param('username') username: string,
  ): Promise<ProfileResponse> {
    return this.profilesService.follow(currentUser, username);
  }

  @ApiOperation({ summary: 'Unfollow a user' })
  @ApiSecurity('token')
  @Delete(':username/follow')
  @UseGuards(JwtAuthGuard)
  unfollow(
    @CurrentUser() currentUser: User,
    @Param('username') username: string,
  ): Promise<ProfileResponse> {
    return this.profilesService.unfollow(currentUser, username);
  }
}
