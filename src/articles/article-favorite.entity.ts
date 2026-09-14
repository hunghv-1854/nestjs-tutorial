import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

@Entity('article_favorites')
@Index(['userId', 'articleId'], { unique: true })
export class ArticleFavorite {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ name: 'article_id' })
  articleId: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
