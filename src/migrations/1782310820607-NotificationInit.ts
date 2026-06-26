import { MigrationInterface, QueryRunner } from "typeorm";

export class NotificationInit1782310820607 implements MigrationInterface {
    name = 'NotificationInit1782310820607'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."notification_type_enum" AS ENUM('APPOINTMENT_BOOKED', 'APPOINTMENT_CANCELLED', 'APPOINTMENT_RESCHEDULED', 'APPOINTMENT_REMINDER', 'FOLLOW_UP_REMINDER')`);
        await queryRunner.query(`CREATE TABLE "notification" ("id" SERIAL NOT NULL, "title" character varying NOT NULL, "message" character varying NOT NULL, "type" "public"."notification_type_enum" NOT NULL, "isRead" boolean NOT NULL DEFAULT false, "createdAt" TIMESTAMP NOT NULL DEFAULT now(), "patientId" integer, CONSTRAINT "PK_705b6c7cdf9b2c2ff7ac7872cb7" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "notification" ADD CONSTRAINT "FK_58802f6c0c1f6a98f2b79d21a1a" FOREIGN KEY ("patientId") REFERENCES "patient_profile"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "notification" DROP CONSTRAINT "FK_58802f6c0c1f6a98f2b79d21a1a"`);
        await queryRunner.query(`DROP TABLE "notification"`);
        await queryRunner.query(`DROP TYPE "public"."notification_type_enum"`);
    }

}
