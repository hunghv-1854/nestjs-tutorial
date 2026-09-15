import { Injectable, UnprocessableEntityException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { I18nService } from 'nestjs-i18n';
import { DataSource, Not, Repository } from 'typeorm';
import { AttachableType } from '../attachments/attachment.entity';
import { AttachmentsService } from '../attachments/attachments.service';
import { AVATARS_URL_PREFIX } from '../common/public-dir.constants';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserFieldsDto } from './dto/update-user.dto';
import { User } from './user.entity';
import { PASSWORD_SALT_ROUNDS } from './users.constants';

interface TakenFieldsQuery {
  email?: string;
  username?: string;
  excludeId?: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly attachmentsService: AttachmentsService,
    private readonly dataSource: DataSource,
    private readonly i18n: I18nService,
  ) {}

  findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        username: true,
        email: true,
        password: true,
        bio: true,
        image: true,
      },
    });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      select: { id: true, username: true, email: true, bio: true, image: true },
    });
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: { id: true, username: true, email: true, bio: true, image: true },
    });
  }

  async create(data: CreateUserDto): Promise<User> {
    await this.assertEmailAndUsernameAreFree({
      email: data.email,
      username: data.username,
    });

    const user = this.usersRepository.create({
      ...data,
      email: data.email.toLowerCase(),
      password: await this.hashPassword(data.password),
    });
    return this.usersRepository.save(user);
  }

  async updateProfile(user: User, changes: UpdateUserFieldsDto): Promise<User> {
    await this.assertEmailAndUsernameAreFree({
      email: changes.email,
      username: changes.username,
      excludeId: user.id,
    });

    if (changes.username !== undefined) user.username = changes.username;
    if (changes.email !== undefined) user.email = changes.email.toLowerCase();
    if (changes.bio !== undefined) user.bio = changes.bio;
    if (changes.image !== undefined) user.image = changes.image;
    if (changes.password !== undefined) {
      user.password = await this.hashPassword(changes.password);
    }

    return this.usersRepository.save(user);
  }

  async updateAvatar(user: User, file: Express.Multer.File): Promise<User> {
    const uploadedUrl = `${AVATARS_URL_PREFIX}/${file.filename}`;
    const previousAttachments = await this.attachmentsService.findAllFor(
      AttachableType.USER,
      user.id,
    );

    let updated: User;
    try {
      updated = await this.dataSource.transaction(async (manager) => {
        const attachment = await this.attachmentsService.attach(
          {
            attachableType: AttachableType.USER,
            attachableId: user.id,
            url: uploadedUrl,
            fileName: file.originalname,
            fileType: file.mimetype,
            fileSize: file.size,
          },
          manager,
        );

        user.image = attachment.url;
        return manager.getRepository(User).save(user);
      });
    } catch (error) {
      // FileInterceptor already saved this file to disk before the
      // transaction ran, so a failed transaction must clean it up itself.
      await this.attachmentsService.deleteFile(uploadedUrl);
      throw error;
    }

    await this.attachmentsService.removeAndDeleteFiles(previousAttachments);

    return updated;
  }

  private async assertEmailAndUsernameAreFree(
    query: TakenFieldsQuery,
  ): Promise<void> {
    const [emailTaken, usernameTaken] = await Promise.all([
      query.email
        ? this.usersRepository.exists({
            where: {
              email: query.email.toLowerCase(),
              ...(query.excludeId !== undefined && {
                id: Not(query.excludeId),
              }),
            },
          })
        : false,
      query.username
        ? this.usersRepository.exists({
            where: {
              username: query.username,
              ...(query.excludeId !== undefined && {
                id: Not(query.excludeId),
              }),
            },
          })
        : false,
    ]);

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
