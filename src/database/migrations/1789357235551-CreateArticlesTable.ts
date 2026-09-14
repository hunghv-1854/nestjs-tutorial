import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateArticlesTable1789357235551 implements MigrationInterface {
  name = 'CreateArticlesTable1789357235551';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "article_favorites" ("id" SERIAL NOT NULL, "user_id" integer NOT NULL, "article_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f11256124cd89a152723cde0440" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_31af347dc5116ca4092699a9c8" ON "article_favorites"  ("user_id", "article_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "articles" ("id" SERIAL NOT NULL, "slug" character varying NOT NULL, "title" character varying NOT NULL, "description" character varying NOT NULL, "body" text NOT NULL, "tag_list" text array NOT NULL DEFAULT '{}', "author_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_1123ff6815c5b8fec0ba9fec370" UNIQUE ("slug"), CONSTRAINT "PK_0a6e2c450d83e0b6052c2793334" PRIMARY KEY ("id"))`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE "articles"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_31af347dc5116ca4092699a9c8"`,
    );
    await queryRunner.query(`DROP TABLE "article_favorites"`);
  }
}
