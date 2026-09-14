import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  PrimaryGeneratedColumn,
} from 'typeorm';

export enum AttachableType {
  USER = 'user',
}

/**
 * Polymorphic file record: one table for every kind of upload (user avatars
 * today, article covers later), disambiguated by attachableType/attachableId.
 * The primary key is a UUID rather than a sequential id so a file's url can't
 * be enumerated/scanned.
 */
@Entity('attachments')
@Index(['attachableType', 'attachableId'])
export class Attachment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'attachable_type', type: 'enum', enum: AttachableType })
  attachableType: AttachableType;

  @Column({ name: 'attachable_id' })
  attachableId: number;

  @Column()
  url: string;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_type' })
  fileType: string;

  @Column({ name: 'file_size' })
  fileSize: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
