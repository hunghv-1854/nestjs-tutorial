import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('follows')
@Index(['followerId', 'followingId'], { unique: true })
export class Follow {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'follower_id' })
  followerId: number;

  @Column({ name: 'following_id' })
  followingId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
