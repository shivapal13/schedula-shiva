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
}