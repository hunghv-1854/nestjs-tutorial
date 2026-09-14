import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { Repository } from 'typeorm';
import { PUBLIC_DIR } from '../common/public-dir.constants';
import { AttachAttachmentDto } from './dto/attach-attachment.dto';
import { Attachment, AttachableType } from './attachment.entity';

@Injectable()
export class AttachmentsService {
  private readonly logger = new Logger(AttachmentsService.name);

  constructor(
    @InjectRepository(Attachment)
    private readonly attachmentsRepository: Repository<Attachment>,
  ) {}

  attach(dto: AttachAttachmentDto): Promise<Attachment> {
    const attachment = this.attachmentsRepository.create(dto);
    return this.attachmentsRepository.save(attachment);
  }

  findAllFor(
    attachableType: AttachableType,
    attachableId: number,
  ): Promise<Attachment[]> {
    return this.attachmentsRepository.find({
      where: { attachableType, attachableId },
    });
  }

  async removeAndDeleteFiles(attachments: Attachment[]): Promise<void> {
    if (!attachments.length) return;

    await this.attachmentsRepository.remove(attachments);
    await Promise.all(attachments.map((a) => this.deleteFile(a.url)));
  }

  async deleteFile(url: string): Promise<void> {
    try {
      await unlink(join(PUBLIC_DIR, url));
    } catch (error) {
      this.logger.warn(`Could not delete file for ${url}: ${String(error)}`);
    }
  }
}
