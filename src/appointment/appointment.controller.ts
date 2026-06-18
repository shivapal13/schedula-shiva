import {
  Controller,
  Post,
  Body,
  Req,
  Get,
  Patch,
  Param,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';
import { Roles } from '../auth/roles.decorator';
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
import { AppointmentService } from './appointment.service';

@Controller('appointment')
export class AppointmentController {
  constructor(
    private readonly appointmentService: AppointmentService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
  bookAppointment(
    @Req() req,
    @Body() dto: any,
  ) {
    return this.appointmentService.bookAppointment(
      req.user.userId,
      dto,
    );
  }
  @Get('my')
@UseGuards(AuthGuard('jwt'))
getMyAppointments(
  @Req() req,
) {
  return this.appointmentService.getMyAppointments(
    req.user.userId,
  );
}
@Patch(':id/cancel')
@UseGuards(AuthGuard('jwt'))
cancelAppointment(
  @Param('id') id: string,
  @Req() req,
) {
  return this.appointmentService.cancelAppointment(
    +id,
    req.user.userId,
  );
}
@Patch(':id/reschedule')
@Roles('PATIENT')
@UseGuards(AuthGuard('jwt'))
rescheduleAppointment(
  @Param('id') id: number,
  @Body() dto: RescheduleAppointmentDto,
  @Req() req,
) {
  return this.appointmentService.rescheduleAppointment(
    Number(id),
    req.user.userId,
    dto,
  );
}
}