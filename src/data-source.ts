import 'dotenv/config';
import { DataSource } from 'typeorm';

import { User } from './users/entity/user.entities';
import { DoctorProfile } from './doctor/doctor.entity';
import { PatientProfile } from './patient/patient.entity';
import { Appointment } from './appointment/appointment.entity';
import { RecurringAvailability } from './availability/recurring-availability.entity';
import { CustomAvailability } from './availability/custom-availability.entity';
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
  synchronize: false,

entities: [
  User,
  DoctorProfile,
  PatientProfile,
  RecurringAvailability,
  CustomAvailability,
  Appointment,
],
  migrations: ['src/migrations/*.ts'],
});