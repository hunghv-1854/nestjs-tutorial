import { join } from 'path';

export const PUBLIC_DIR = join(process.cwd(), 'public');
export const AVATARS_DIR = join(PUBLIC_DIR, 'uploads', 'avatars');
export const AVATARS_URL_PREFIX = '/uploads/avatars';
