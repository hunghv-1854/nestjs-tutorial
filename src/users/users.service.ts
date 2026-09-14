import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Not, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

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

  async findTakenFields(
    query: TakenFieldsQuery,
  ): Promise<{ emailTaken: boolean; usernameTaken: boolean }> {
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

    return { emailTaken, usernameTaken };
  }

  create(data: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      ...data,
      email: data.email.toLowerCase(),
    });
    return this.usersRepository.save(user);
  }

  save(user: User): Promise<User> {
    return this.usersRepository.save(user);
  }
}
