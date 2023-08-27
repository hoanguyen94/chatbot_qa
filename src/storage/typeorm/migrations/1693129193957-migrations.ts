import { MigrationInterface, QueryRunner } from "typeorm";

export class Migrations1693129193957 implements MigrationInterface {
    name = 'Migrations1693129193957'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "influencers" ("id" SERIAL NOT NULL, "channel" character varying NOT NULL, "userid" character varying, "name" character varying, "category1" character varying, "category2" character varying, "followers" integer, "likes" integer, "comments" integer, "shares" integer, "views" integer, "country" character varying, CONSTRAINT "PK_a5bbdc11f7898f2a695208b337a" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "influencers"`);
    }

}
