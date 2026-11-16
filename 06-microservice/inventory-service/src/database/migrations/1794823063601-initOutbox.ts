import { MigrationInterface, QueryRunner } from "typeorm";

export class InitOutbox1794823063601 implements MigrationInterface {
    name = 'InitOutbox1794823063601'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TABLE "outbox_message" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "topic" character varying NOT NULL, "messageKey" character varying NOT NULL, "payload" jsonb NOT NULL, "status" character varying NOT NULL DEFAULT 'PENDING', "attempts" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "publishedAt" TIMESTAMP WITH TIME ZONE, "nextRetryAt" TIMESTAMP WITH TIME ZONE, CONSTRAINT "PK_2f36ee5236f2793f3e7bd554589" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "outbox_message"`);
    }

}
