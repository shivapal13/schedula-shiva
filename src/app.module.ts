import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { DoctorModule } from './doctor/doctor.module';
import { PatientModule } from './patient/patient.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { AvailabilityModule } from './availability/availability.module';
import { AppointmentModule } from './appointment/appointment.module';
import { NotificationModule } from './notification/notification.module';
import { ScheduleModule } from '@nestjs/schedule';
import { ReminderService } from './reminder/reminder.service';
import { ReminderModule } from './reminder/reminder.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
     ScheduleModule.forRoot(),
     ReminderModule,

  TypeOrmModule.forRoot({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  autoLoadEntities: true,
  synchronize: false,
  ssl: {
    rejectUnauthorized: false,
  },
}),

    AuthModule,
    UsersModule,
    DoctorModule,
    PatientModule,
    AvailabilityModule,
    AppointmentModule,
    NotificationModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}