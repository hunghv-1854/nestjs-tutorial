import { randomBytes } from 'crypto';

function slugifyTitle(title: string): string {
  return (
    title
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'article'
  );
}

export function generateArticleSlug(title: string): string {
  return `${slugifyTitle(title)}-${randomBytes(4).toString('hex')}`;
}
