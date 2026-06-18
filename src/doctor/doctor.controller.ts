import {
  Controller,
  Post,
  Get,
  Patch,
  Body,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { DoctorService } from './doctor.service';
import { AppointmentService } from '../appointment/appointment.service';

@Controller('doctor/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
    private readonly appointmentService:AppointmentService
  ) {}

  @Post()
  create(
    @Req() req,
    @Body() dto,
  ) {
    return this.doctorService.create(
      req.user.userId,
      dto,
    );
  }

  @Get()
  get(
    @Req() req,
  ) {
    return this.doctorService.get(
      req.user.userId,
    );
  }

  @Patch()
  update(
    @Req() req,
    @Body() dto,
  ) {
    return this.doctorService.update(
      req.user.userId,
      dto,
    );
}
@Get('appointments')
getDoctorAppointments(
  @Req() req,
) {
  return this.appointmentService.getDoctorAppointments(
    req.user.userId,
  );
}
}