import { MigrationInterface, QueryRunner } from "typeorm";

export class AddTaskSelfReference1793001662018 implements MigrationInterface {
    name = 'AddTaskSelfReference1793001662018'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checklist_items" DROP CONSTRAINT "fk_task_id"`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD "parent_id" uuid`);
        await queryRunner.query(`ALTER TABLE "tasks" ADD CONSTRAINT "fk_tasks_parent" FOREIGN KEY ("parent_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "checklist_items" ADD CONSTRAINT "fk_task_id" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE CASCADE ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "checklist_items" DROP CONSTRAINT "fk_task_id"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP CONSTRAINT "fk_tasks_parent"`);
        await queryRunner.query(`ALTER TABLE "tasks" DROP COLUMN "parent_id"`);
        await queryRunner.query(`ALTER TABLE "checklist_items" ADD CONSTRAINT "fk_task_id" FOREIGN KEY ("task_id") REFERENCES "tasks"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

}
