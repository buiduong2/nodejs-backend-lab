import { MigrationInterface, QueryRunner } from "typeorm";

export class InitInventory1794392913519 implements MigrationInterface {
    name = 'InitInventory1794392913519'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."product_reservation_status_enum" AS ENUM('RESERVED', 'RELEASED', 'CONFIRMED')`);
        await queryRunner.query(`CREATE TABLE "product_reservation" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "orderId" character varying NOT NULL, "sagaId" character varying NOT NULL, "items" json NOT NULL, "status" "public"."product_reservation_status_enum" NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_8431374df53e02c5f0fe7e54e0b" UNIQUE ("orderId"), CONSTRAINT "PK_f465b76482e182e9aa0afdc3829" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "product" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "quantity" integer NOT NULL, "reservedQuantity" integer NOT NULL, "name" character varying NOT NULL, CONSTRAINT "PK_bebc9158e480b949565b4dc7a82" PRIMARY KEY ("id"))`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP TABLE "product"`);
        await queryRunner.query(`DROP TABLE "product_reservation"`);
        await queryRunner.query(`DROP TYPE "public"."product_reservation_status_enum"`);
    }

}
