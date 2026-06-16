import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { DoctorDiscoveryController } from './doctor-discovery.controller';
import { DoctorProfile } from './doctor.entity';
import { User } from '../users/entity/user.entities';
import { RecurringAvailability } from '../availability/recurring-availability.entity';
import { CustomAvailability } from '../availability/custom-availability.entity';
import { AppointmentModule } from '../appointment/appointment.module';
import { Appointment } from '../appointment/appointment.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
  DoctorProfile,
  User,
  RecurringAvailability,
  CustomAvailability,
  Appointment
]),
  AppointmentModule,
  ],
 controllers: [
  DoctorController,
  DoctorDiscoveryController
],
  providers: [DoctorService],
})
export class DoctorModule {}