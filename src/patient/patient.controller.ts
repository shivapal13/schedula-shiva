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

import { PatientService } from './patient.service';

@Controller('patient/profile')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('PATIENT')
export class PatientController {
  constructor(
    private readonly patientService: PatientService,
  ) {}

  @Post()
  create(
    @Req() req,
    @Body() dto,
  ) {
    return this.patientService.create(
      req.user.userId,
      dto,
    );
  }

  @Get()
  get(@Req() req) {
    return this.patientService.get(
      req.user.userId,
    );
  }

  @Patch()
  update(
    @Req() req,
    @Body() dto,
  ) {
    return this.patientService.update(
      req.user.userId,
      dto,
    );
  }
}