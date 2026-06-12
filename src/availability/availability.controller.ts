import {
  Controller,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import {AvailabilityService} from './availability.service';
import { Query } from '@nestjs/common';
@Controller('doctor/availability')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('DOCTOR')
export class AvailabilityController {
  constructor(
    private readonly availabilityService: AvailabilityService,
  ) {}

  @Post()
  create(
    @Req() req,
    @Body() dto,
  ) {
    return this.availabilityService.create(
      req.user.userId,
      dto,
    );
  }
 @Get()
getAll(@Req() req) {
  return this.availabilityService.getAll(
    req.user.userId,
  );
}
@Patch(':id')
update(
  @Param('id') id: number,
  @Req() req,
  @Body() dto,
) {
  return this.availabilityService.update(
    +id,
    req.user.userId,
    dto,
  );
}
@Delete(':id')
remove(
  @Param('id') id: number,
  @Req() req,
) {
  return this.availabilityService.remove(
    +id,
    req.user.userId,
  );
}
@Post('override')
createOverride(
  @Req() req,
  @Body() dto,
) {
  return this.availabilityService.createOverride(
    req.user.userId,
    dto,
  );
}
@Get('date')
getByDate(
  @Req() req,
  @Query('date') date: string,
) {
  return this.availabilityService.getByDate(
    req.user.userId,
    date,
  );
}
}