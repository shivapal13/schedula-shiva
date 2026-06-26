import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AppointmentController } from './appointment.controller';
import { AppointmentService } from './appointment.service';

import { Appointment } from './appointment.entity';
import { DoctorProfile } from '../doctor/doctor.entity';
import { PatientProfile } from '../patient/patient.entity';
import { RecurringAvailability } from '../availability/recurring-availability.entity';
import { Notification } from '../notification/notification.entity';
import { NotificationService } from '../notification/notification.service';
import { NotificationModule } from '../notification/notification.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
      DoctorProfile,
      PatientProfile,
      RecurringAvailability,
      Notification,
      NotificationService
    ]),
    NotificationModule
  ],
  controllers: [AppointmentController],
  providers: [AppointmentService],
  exports:[AppointmentService,TypeOrmModule]
})
export class AppointmentModule {}