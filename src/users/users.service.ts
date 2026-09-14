import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './user.entity';

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

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      select: { id: true, username: true, email: true, bio: true, image: true },
    });
  }

  async findTakenFields(
    email: string,
    username: string,
  ): Promise<{ emailTaken: boolean; usernameTaken: boolean }> {
    const [emailTaken, usernameTaken] = await Promise.all([
      this.usersRepository.exists({ where: { email: email.toLowerCase() } }),
      this.usersRepository.exists({ where: { username } }),
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
}
