import { Module} from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Appointment } from "../appointment/appointment.entity";
import { NotificationModule } from "../notification/notification.module";
import { ReminderService } from "./reminder.service";
@Module({
  imports: [
    TypeOrmModule.forFeature([
      Appointment,
    ]),
    NotificationModule,
  ],
  providers: [ReminderService],
})
export class ReminderModule {}