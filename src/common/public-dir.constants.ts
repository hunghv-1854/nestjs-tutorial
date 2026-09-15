import { join } from 'path';

export const PUBLIC_DIR = join(process.cwd(), 'public');
export const AVATARS_DIR = join(PUBLIC_DIR, 'uploads', 'avatars');
export const AVATARS_URL_PREFIX = '/uploads/avatars';
export const MAX_AVATAR_SIZE_BYTES = 5 * 1024 * 1024;
export const ALLOWED_AVATAR_MIME_TYPES = new Set([
  'image/png',
  'image/jpeg',
  'image/webp',
]);
