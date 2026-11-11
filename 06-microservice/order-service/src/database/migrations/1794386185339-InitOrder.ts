import { MigrationInterface, QueryRunner } from "typeorm";

export class InitOrder1794386185339 implements MigrationInterface {
    name = 'InitOrder1794386185339'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."order_status" AS ENUM('PENDING', 'RESERVING_STOCK', 'PAYMENT_PENDING', 'CONFIRMED', 'REJECTED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "customerId" character varying NOT NULL, "items" jsonb NOT NULL, "totalAmount" bigint NOT NULL, "status" "public"."order_status" NOT NULL DEFAULT 'PENDING', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."saga_currentstep_enum" AS ENUM('RESERVE_INVENTORY', 'CHARGE_PAYMENT', 'RELEASE_INVENTORY', 'COMPLETED')`);
        await queryRunner.query(`CREATE TYPE "public"."saga_status_enum" AS ENUM('RUNNING', 'COMPENSATING', 'COMPLETED', 'COMPENSATED', 'FAILED')`);
        await queryRunner.query(`CREATE TABLE "saga" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" uuid NOT NULL, "currentStep" "public"."saga_currentstep_enum", "status" "public"."saga_status_enum" NOT NULL DEFAULT 'RUNNING', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "version" integer NOT NULL, CONSTRAINT "UQ_4b060ebb00478a66dc7c0a9dd51" UNIQUE ("orderId"), CONSTRAINT "REL_4b060ebb00478a66dc7c0a9dd5" UNIQUE ("orderId"), CONSTRAINT "PK_dd0546a57e0bc8b7efc4f525c7d" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "saga" ADD CONSTRAINT "FK_4b060ebb00478a66dc7c0a9dd51" FOREIGN KEY ("orderId") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "saga" DROP CONSTRAINT "FK_4b060ebb00478a66dc7c0a9dd51"`);
        await queryRunner.query(`DROP TABLE "saga"`);
        await queryRunner.query(`DROP TYPE "public"."saga_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."saga_currentstep_enum"`);
        await queryRunner.query(`DROP TABLE "orders"`);
        await queryRunner.query(`DROP TYPE "public"."order_status"`);
    }

}
