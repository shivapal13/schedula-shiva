import { MigrationInterface, QueryRunner } from "typeorm";

export class Init1781096109927 implements MigrationInterface {
    name = 'Init1781096109927'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."user_role_enum" AS ENUM('DOCTOR', 'PATIENT')`);
        await queryRunner.query(`CREATE TABLE "user" ("id" SERIAL NOT NULL, "username" character varying NOT NULL, "email" character varying NOT NULL, "password" character varying NOT NULL, "role" "public"."user_role_enum" NOT NULL, CONSTRAINT "UQ_e12875dfb3b1d92d7d7c5377e22" UNIQUE ("email"), CONSTRAINT "PK_cace4a159ff9f2512dd42373760" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "doctor_profile" ("id" SERIAL NOT NULL, "fullName" character varying NOT NULL, "specialization" character varying NOT NULL, "experience" integer NOT NULL, "qualification" character varying NOT NULL, "consultationFee" numeric NOT NULL, "availability" character varying NOT NULL, "profileDetails" character varying, "userId" integer, CONSTRAINT "REL_f3a33e785199cebab93b11d123" UNIQUE ("userId"), CONSTRAINT "PK_644ccb5654dfad6ae661c5684aa" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "patient_profile" ("id" SERIAL NOT NULL, "fullName" character varying NOT NULL, "age" integer NOT NULL, "gender" character varying NOT NULL, "contactDetails" character varying NOT NULL, "healthInfo" character varying, "userId" integer, CONSTRAINT "REL_1de3767e7d351c683f4f8923ae" UNIQUE ("userId"), CONSTRAINT "PK_17f75e7aa12a2d0b0c3924b2e81" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "doctor_profile" ADD CONSTRAINT "FK_f3a33e785199cebab93b11d1237" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "patient_profile" ADD CONSTRAINT "FK_1de3767e7d351c683f4f8923aef" FOREIGN KEY ("userId") REFERENCES "user"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "patient_profile" DROP CONSTRAINT "FK_1de3767e7d351c683f4f8923aef"`);
        await queryRunner.query(`ALTER TABLE "doctor_profile" DROP CONSTRAINT "FK_f3a33e785199cebab93b11d1237"`);
        await queryRunner.query(`DROP TABLE "patient_profile"`);
        await queryRunner.query(`DROP TABLE "doctor_profile"`);
        await queryRunner.query(`DROP TABLE "user"`);
        await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
    }

}
