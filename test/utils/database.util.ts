import { DataSource } from 'typeorm';

const TABLES_IN_FK_SAFE_ORDER = [
  'comments',
  'article_favorites',
  'articles',
  'attachments',
  'follows',
  'users',
];

/** Wipes every table between test cases so each test starts from a clean, known state. */
export async function truncateAll(dataSource: DataSource): Promise<void> {
  await dataSource.query(
    `TRUNCATE TABLE ${TABLES_IN_FK_SAFE_ORDER.map((t) => `"${t}"`).join(', ')} RESTART IDENTITY CASCADE`,
  );
}
