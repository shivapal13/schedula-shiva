import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';

import { Appointment } from './appointment.entity';
import { DoctorProfile } from '../doctor/doctor.entity';
import { PatientProfile } from '../patient/patient.entity';
import { RecurringAvailability } from '../availability/recurring-availability.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      DoctorProfile,
      PatientProfile,
      RecurringAvailability,
    ]),
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports:[AppointmentService,TypeOrmModule]
})
export class AppointmentModule {}