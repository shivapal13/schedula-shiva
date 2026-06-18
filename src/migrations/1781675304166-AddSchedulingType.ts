import { MigrationInterface, QueryRunner } from "typeorm";

export class AddSchedulingType1781675304166 implements MigrationInterface {
    name = 'AddSchedulingType1781675304166'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "appointments" ADD "tokenNumber" integer`);
        await queryRunner.query(`CREATE TYPE "public"."recurring_availability_schedulingtype_enum" AS ENUM('STREAM', 'WAVE')`);
        await queryRunner.query(`ALTER TABLE "recurring_availability" ADD "schedulingType" "public"."recurring_availability_schedulingtype_enum" NOT NULL DEFAULT 'STREAM'`);
        await queryRunner.query(`ALTER TABLE "recurring_availability" ADD "bufferTime" integer`);
        await queryRunner.query(`ALTER TABLE "recurring_availability" ADD "capacity" integer`);
        await queryRunner.query(`CREATE TYPE "public"."custom_availability_schedulingtype_enum" AS ENUM('STREAM', 'WAVE')`);
        await queryRunner.query(`ALTER TABLE "custom_availability" ADD "schedulingType" "public"."custom_availability_schedulingtype_enum" NOT NULL DEFAULT 'STREAM'`);
        await queryRunner.query(`ALTER TABLE "custom_availability" ADD "bufferTime" integer`);
        await queryRunner.query(`ALTER TABLE "custom_availability" ADD "capacity" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_availability" DROP COLUMN "capacity"`);
        await queryRunner.query(`ALTER TABLE "custom_availability" DROP COLUMN "bufferTime"`);
        await queryRunner.query(`ALTER TABLE "custom_availability" DROP COLUMN "schedulingType"`);
        await queryRunner.query(`DROP TYPE "public"."custom_availability_schedulingtype_enum"`);
        await queryRunner.query(`ALTER TABLE "recurring_availability" DROP COLUMN "capacity"`);
        await queryRunner.query(`ALTER TABLE "recurring_availability" DROP COLUMN "bufferTime"`);
        await queryRunner.query(`ALTER TABLE "recurring_availability" DROP COLUMN "schedulingType"`);
        await queryRunner.query(`DROP TYPE "public"."recurring_availability_schedulingtype_enum"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP COLUMN "tokenNumber"`);
    }

}
