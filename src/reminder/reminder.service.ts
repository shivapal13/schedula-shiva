import { Injectable } from "@nestjs/common";
import { Cron } from "@nestjs/schedule";
import { CronExpression } from "@nestjs/schedule";
import { Appointment } from "../appointment/appointment.entity";
import { InjectRepository} from "@nestjs/typeorm";
import { NotificationService } from "../notification/notification.service";
import { NotificationType } from "../notification/notification.entity";
import {
  AppointmentStatus,
} from '../appointment/appointment.entity';
import { SchedulingType } from "../availability/scheduling-type.enum";
import { Repository } from "typeorm";
@Injectable()
export class ReminderService {
  constructor(
  @InjectRepository(Appointment)
  private appointmentRepo:
    Repository<Appointment>,

  private notificationService:
    NotificationService,
) {}
 @Cron(
  CronExpression.EVERY_MINUTE,
)
async sendReminders() {
  const appointments =
    await this.appointmentRepo.find({
      where: {
        status:
          AppointmentStatus.BOOKED,
        reminderSent: false,
      },
      relations: [
        'doctor',
        'patient',
      ],
    });


  for (const appointment of appointments) {
    const appointmentTime =
      new Date(
        `${appointment.date}T${appointment.startTime}:00`,
      );

    const diffMinutes =
      (appointmentTime.getTime() -
        Date.now()) /
      (1000 * 60);

      if (
  diffMinutes <= 60 &&
  diffMinutes > 0
) {

  let message: string;
    if (
  appointment.schedulingType==SchedulingType.WAVE
) {
message = [
`Reminder: You have an appointment with ${appointment.doctor.fullName} today.`,
`Reporting Time: ${appointment.startTime}`,
`Token Number: ${appointment.tokenNumber}`
].join("|")
} else {
message =[
`Reminder: You have an appointment with ${appointment.doctor.fullName} today.`,
`Appointment Date: ${appointment.date}`,
`Appointment Time: ${appointment.startTime}`
].join("|")
}
console.log(message)

  await this.notificationService
  .createNotification(
    appointment.patient,
    'Appointment Reminder',
    message,
    NotificationType.APPOINTMENT_REMINDER,
  );
   appointment.reminderSent =
  true;

await this.appointmentRepo.save(
  appointment,
);
    }
    
  }
  
}
}