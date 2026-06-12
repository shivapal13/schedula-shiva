import {
  Controller,
  Get,
  Param,
  Query,
} from '@nestjs/common';

import { DoctorService } from './doctor.service';

@Controller('availibility')
export class DoctorDiscoveryController {
  constructor(
    private readonly doctorService: DoctorService,
  ) {}

  @Get()
  findAll(
    @Query('page') page = '1',
    @Query('limit') limit = '10',
    @Query('search') search?: string,
    @Query('specialization')
    specialization?: string,
  ) {
    return this.doctorService.findAll({
      page: +page,
      limit: +limit,
      search,
      specialization,
    });
  }

    @Get(':doctorId/slots')
getSlots(
  @Param('doctorId') doctorId: string,
  @Query('date') date: string,
  @Query('duration') duration = '15',
) {
  return this.doctorService.getSlots(
    +doctorId,
    date,
    +duration,
  );
}

  @Get(':id')
  findOne(
    @Param('id') id: string,
  ) {
    return this.doctorService.findOne(+id);
  }
}