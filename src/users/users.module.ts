import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AttachmentsModule } from '../attachments/attachments.module';
import { User } from './user.entity';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AttachmentsModule],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
