import { MigrationInterface, QueryRunner } from "typeorm";

export class InitSchema1781587262434 implements MigrationInterface {
    name = 'InitSchema1781587262434'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('DOCTOR', 'PATIENT')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "doctor_profile" ("id" SERIAL NOT NULL, "fullName" character varying NOT NULL, "specialization" character varying NOT NULL, "experience" integer NOT NULL, "qualification" character varying NOT NULL, "consultationFee" numeric NOT NULL, "availability" character varying NOT NULL, "profileDetails" character varying, "userId" integer, CONSTRAINT "REL_f3a33e785199cebab93b11d123" UNIQUE ("userId"), CONSTRAINT "PK_644ccb5654dfad6ae661c5684aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patient_profile" ("id" SERIAL NOT NULL, "fullName" character varying NOT NULL, "age" integer NOT NULL, "gender" character varying NOT NULL, "contactDetails" character varying NOT NULL, "healthInfo" character varying, "userId" integer, CONSTRAINT "REL_1de3767e7d351c683f4f8923ae" UNIQUE ("userId"), CONSTRAINT "PK_17f75e7aa12a2d0b0c3924b2e81" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."appointments_status_enum" AS ENUM('BOOKED', 'CANCELLED')`);
        await queryRunner.query(`CREATE TABLE "appointments" ("id" SERIAL NOT NULL, "date" character varying NOT NULL, "startTime" character varying NOT NULL, "endTime" character varying NOT NULL, "status" "public"."appointments_status_enum" NOT NULL DEFAULT 'BOOKED', "doctorId" integer, "patientId" integer, CONSTRAINT "PK_4a437a9a27e948726b8bb3e36ad" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "recurring_availability" ("id" SERIAL NOT NULL, "dayOfWeek" character varying NOT NULL, "startTime" character varying NOT NULL, "endTime" character varying NOT NULL, "doctorId" integer, CONSTRAINT "PK_2464dd095ba418858c1aa3f4e01" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "custom_availability" ("id" SERIAL NOT NULL, "date" character varying NOT NULL, "startTime" character varying NOT NULL, "endTime" character varying NOT NULL, "doctorId" integer, CONSTRAINT "PK_e9b8fa5803ca3d6554a7ddf7045" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "doctor_profile" ADD CONSTRAINT "FK_f3a33e785199cebab93b11d1237" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_profile" ADD CONSTRAINT "FK_1de3767e7d351c683f4f8923aef" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_0c1af27b469cb8dca420c160d65" FOREIGN KEY ("doctorId") REFERENCES "doctor_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "appointments" ADD CONSTRAINT "FK_13c2e57cb81b44f062ba24df57d" FOREIGN KEY ("patientId") REFERENCES "patient_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "recurring_availability" ADD CONSTRAINT "FK_5c644a995dc9bed981684fb32f8" FOREIGN KEY ("doctorId") REFERENCES "doctor_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "custom_availability" ADD CONSTRAINT "FK_1a33c02748c794ea9bf0a13fbf0" FOREIGN KEY ("doctorId") REFERENCES "doctor_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "custom_availability" DROP CONSTRAINT "FK_1a33c02748c794ea9bf0a13fbf0"`);
        await queryRunner.query(`ALTER TABLE "recurring_availability" DROP CONSTRAINT "FK_5c644a995dc9bed981684fb32f8"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_13c2e57cb81b44f062ba24df57d"`);
        await queryRunner.query(`ALTER TABLE "appointments" DROP CONSTRAINT "FK_0c1af27b469cb8dca420c160d65"`);
        await queryRunner.query(`ALTER TABLE "patient_profile" DROP CONSTRAINT "FK_1de3767e7d351c683f4f8923aef"`);
        await queryRunner.query(`ALTER TABLE "doctor_profile" DROP CONSTRAINT "FK_f3a33e785199cebab93b11d1237"`);
        await queryRunner.query(`DROP TABLE "custom_availability"`);
        await queryRunner.query(`DROP TABLE "recurring_availability"`);
        await queryRunner.query(`DROP TABLE "appointments"`);
        await queryRunner.query(`DROP TYPE "public"."appointments_status_enum"`);
        await queryRunner.query(`DROP TABLE "patient_profile"`);
        await queryRunner.query(`DROP TABLE "doctor_profile"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
