import { MigrationInterface, QueryRunner } from "typeorm";

export class AddLeaseRecoveryOutboxMsg1794887852281 implements MigrationInterface {
    name = 'AddLeaseRecoveryOutboxMsg1794887852281'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "outbox_message" ADD "lastError" text`);
        await queryRunner.query(`ALTER TABLE "outbox_message" ADD "claimToken" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "outbox_message" DROP COLUMN "claimToken"`);
        await queryRunner.query(`ALTER TABLE "outbox_message" DROP COLUMN "lastError"`);
    }

}
