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
    });
  }

  findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({ where: { id } });
  }

  async findTakenFields(
    email: string,
    username: string,
  ): Promise<{ emailTaken: boolean; usernameTaken: boolean }> {
    const [byEmail, byUsername] = await Promise.all([
      this.usersRepository.findOne({ where: { email: email.toLowerCase() } }),
      this.usersRepository.findOne({ where: { username } }),
    ]);
    return { emailTaken: !!byEmail, usernameTaken: !!byUsername };
  }

  create(data: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create({
      ...data,
      email: data.email.toLowerCase(),
    });
    return this.usersRepository.save(user);
  }
}
