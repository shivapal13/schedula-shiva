import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSchedulingTypeToAppointment1782710852147 implements MigrationInterface {
    name = 'AddSchedulingTypeToAppointment1782710852147'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."appointments_schedulingtype_enum" AS ENUM('STREAM', 'WAVE')`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD "schedulingType" "public"."appointments_schedulingtype_enum" NOT NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "schedulingType"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_schedulingtype_enum"`);
    }

}
