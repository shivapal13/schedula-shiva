import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { NotificationController } from './notification.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PatientProfile } from '../patient/patient.entity';
import { Notification } from './notification.entity';
@Module({
  imports: [
  TypeOrmModule.forFeature([
    Notification,
    PatientProfile,
  ]),
],
  providers: [NotificationService],
  controllers: [NotificationController]
})

export class NotificationModule {}
