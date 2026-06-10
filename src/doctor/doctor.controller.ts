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

@Controller('doctor/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR')
export class DoctorController {
  constructor(
    private readonly doctorService: DoctorService,
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
}