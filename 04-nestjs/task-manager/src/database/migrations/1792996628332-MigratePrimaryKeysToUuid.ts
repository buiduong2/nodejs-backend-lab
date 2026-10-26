import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { MigrationInterface, QueryRunner } from 'typeorm';

export class MigratePrimaryKeysToUuid1792996628332 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    const sql = readFileSync(
      join(__dirname, '../sql/migrate-integer-to-uuid.sql'),
      'utf8',
    );
    
    await queryRunner.query(sql);
  }

  //  forward-only migration:
  public async down(queryRunner: QueryRunner): Promise<void> {
    throw new Error(
      'Automatic rollback is not supported for UUID primary key migration',
    );
  }
}
