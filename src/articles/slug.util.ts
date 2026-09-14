import { randomBytes } from 'crypto';

function slugifyTitle(title: string): string {
  return (
    title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'article'
  );
}

/** Appends a short random suffix so two articles with the same title never collide. */
export function generateArticleSlug(title: string): string {
  return `${slugifyTitle(title)}-${randomBytes(4).toString('hex')}`;
}
