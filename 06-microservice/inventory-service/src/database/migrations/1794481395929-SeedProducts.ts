
import { MigrationInterface, QueryRunner } from 'typeorm';

export class SeedProducts1794478028955
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      INSERT INTO "product"
        ("id", "name", "quantity", "reservedQuantity")
      VALUES
        (
          '11111111-1111-4111-8111-111111111111',
          'Laptop Dell XPS',
          1000000,
          0
        ),
        (
          '22222222-2222-4222-8222-222222222222',
          'Mechanical Keyboard',
          1000000,
          0
        ),
        (
          '44444444-4444-4444-8444-444444444444',
          'MacBook Pro M4',
          5,
          0
        )
      ON CONFLICT ("id") DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DELETE FROM "product"
      WHERE "id" IN (
        '11111111-1111-4111-8111-111111111111',
        '22222222-2222-4222-8222-222222222222',
        '44444444-4444-4444-8444-444444444444'
      )
    `);
  }
}
