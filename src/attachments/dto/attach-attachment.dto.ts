import { AttachableType } from '../attachment.entity';

export interface AttachAttachmentDto {
  attachableType: AttachableType;
  attachableId: number;
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
}
