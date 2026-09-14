import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateAttachmentsTable1789355640888 implements MigrationInterface {
  name = 'CreateAttachmentsTable1789355640888';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TYPE "public"."attachments_attachable_type_enum" AS ENUM('user')`,
    );
    await queryRunner.query(
      `CREATE TABLE "attachments" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "attachable_type" "public"."attachments_attachable_type_enum" NOT NULL, "attachable_id" integer NOT NULL, "url" character varying NOT NULL, "file_name" character varying NOT NULL, "file_type" character varying NOT NULL, "file_size" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5e1f050bcff31e3084a1d662412" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_418b716a9043b7a66cfa8d22db" ON "attachments"  ("attachable_type", "attachable_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "follows" ("id" SERIAL NOT NULL, "follower_id" integer NOT NULL, "following_id" integer NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8988f607744e16ff79da3b8a627" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "IDX_8109e59f691f0444b43420f698" ON "follows"  ("follower_id", "following_id") `,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP INDEX "public"."IDX_8109e59f691f0444b43420f698"`,
    );
    await queryRunner.query(`DROP TABLE "follows"`);
    await queryRunner.query(
      `DROP INDEX "public"."IDX_418b716a9043b7a66cfa8d22db"`,
    );
    await queryRunner.query(`DROP TABLE "attachments"`);
    await queryRunner.query(
      `DROP TYPE "public"."attachments_attachable_type_enum"`,
    );
  }
}
