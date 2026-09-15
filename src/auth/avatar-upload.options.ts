import { BadRequestException } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { extname } from 'path';
import { diskStorage } from 'multer';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';
import {
  ALLOWED_AVATAR_MIME_TYPES,
  AVATARS_DIR,
  MAX_AVATAR_SIZE_BYTES,
} from '../common/public-dir.constants';

export const avatarUploadOptions: MulterOptions = {
  storage: diskStorage({
    destination: AVATARS_DIR,
    filename: (_req, file, callback) => {
      callback(null, `${randomUUID()}${extname(file.originalname)}`);
    },
  }),
  limits: { fileSize: MAX_AVATAR_SIZE_BYTES },
  fileFilter: (_req, file, callback) => {
    if (!ALLOWED_AVATAR_MIME_TYPES.has(file.mimetype)) {
      callback(new BadRequestException('Unsupported image type'), false);
      return;
    }
    callback(null, true);
  },
};
