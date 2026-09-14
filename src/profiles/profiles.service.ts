import {
  Injectable,
  NotFoundException,
  UnprocessableEntityException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { I18nService } from 'nestjs-i18n';
import { In, Repository } from 'typeorm';
import { User } from '../users/user.entity';
import { UsersService } from '../users/users.service';
import { Follow } from './follow.entity';
import { ProfileResponse } from './profile-response.interface';

@Injectable()
export class ProfilesService {
  constructor(
    private readonly usersService: UsersService,
    private readonly i18n: I18nService,
    @InjectRepository(Follow)
    private readonly followsRepository: Repository<Follow>,
  ) {}

  async getProfile(
    username: string,
    currentUserId?: number,
  ): Promise<ProfileResponse> {
    const target = await this.findUserOrFail(username);
    const following = await this.isFollowing(currentUserId, target.id);
    return this.buildResponse(target, following);
  }

  async follow(
    currentUser: User,
    targetUsername: string,
  ): Promise<ProfileResponse> {
    const target = await this.findUserOrFail(targetUsername);
    if (target.id === currentUser.id) {
      throw new UnprocessableEntityException({
        errors: { username: [this.i18n.t('profiles.cannot_follow_self')] },
      });
    }

    const alreadyFollowing = await this.isFollowing(currentUser.id, target.id);
    if (!alreadyFollowing) {
      await this.followsRepository.save(
        this.followsRepository.create({
          followerId: currentUser.id,
          followingId: target.id,
        }),
      );
    }

    return this.buildResponse(target, true);
  }

  async unfollow(
    currentUser: User,
    targetUsername: string,
  ): Promise<ProfileResponse> {
    const target = await this.findUserOrFail(targetUsername);
    await this.followsRepository.delete({
      followerId: currentUser.id,
      followingId: target.id,
    });
    return this.buildResponse(target, false);
  }

  /**
   * Which of `candidateIds` does `followerId` follow? Used to batch-resolve
   * "following" flags for a list of authors (e.g. an article feed) in one query.
   */
  async getFollowingIds(
    followerId: number | undefined,
    candidateIds: number[],
  ): Promise<Set<number>> {
    if (!followerId || !candidateIds.length) return new Set();

    const rows = await this.followsRepository.find({
      where: { followerId, followingId: In(candidateIds) },
    });
    return new Set(rows.map((row) => row.followingId));
  }

  /** All user ids that `followerId` currently follows. */
  async getAllFollowingIds(followerId: number): Promise<Set<number>> {
    const rows = await this.followsRepository.find({ where: { followerId } });
    return new Set(rows.map((row) => row.followingId));
  }

  private async findUserOrFail(username: string): Promise<User> {
    const user = await this.usersService.findByUsername(username);
    if (!user) {
      throw new NotFoundException({
        errors: { username: [this.i18n.t('profiles.user_not_found')] },
      });
    }
    return user;
  }

  private async isFollowing(
    followerId: number | undefined,
    followingId: number,
  ): Promise<boolean> {
    if (!followerId) return false;
    return this.followsRepository.exists({
      where: { followerId, followingId },
    });
  }

  private buildResponse(user: User, following: boolean): ProfileResponse {
    return {
      profile: {
        username: user.username,
        bio: user.bio,
        image: user.image,
        following,
      },
    };
  }
}
