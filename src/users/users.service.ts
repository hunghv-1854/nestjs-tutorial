import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

interface TakenFieldsQuery {
  email?: string;
  username?: string;
  /** Exclude this user's own row — used when checking conflicts during an update. */
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
    });
  }

  findByUsername(username: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { username } });
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  findByIds(ids: number[]): Promise<User[]> {
    if (!ids.length) return Promise.resolve([]);
    return this.usersRepository.find({ where: { id: In(ids) } });
  }

  async findTakenFields(
    query: TakenFieldsQuery,
  ): Promise<{ emailTaken: boolean; usernameTaken: boolean }> {
    const [byEmail, byUsername] = await Promise.all([
      query.email
        ? this.usersRepository.findOne({
            where: { email: query.email.toLowerCase() },
          })
        : null,
      query.username
        ? this.usersRepository.findOne({ where: { username: query.username } })
        : null,
    ]);

    return {
      emailTaken: !!byEmail && byEmail.id !== query.excludeId,
      usernameTaken: !!byUsername && byUsername.id !== query.excludeId,
    };
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
