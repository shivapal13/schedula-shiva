import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSlotDuration1782202973470 implements MigrationInterface {
    name = 'AddSlotDuration1782202973470'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recurring_availability" ADD "slotDuration" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "recurring_availability" DROP COLUMN "slotDuration"`);
    }

}
