import { MigrationInterface, QueryRunner } from "typeorm";

export class ReminderInit1782624311474 implements MigrationInterface {
    name = 'ReminderInit1782624311474'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "reminderSent" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "reminderSent"`);
    }

}
