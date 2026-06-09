import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';
import { DoctorDiscoveryController } from './doctor-discovery.controller';
import { DoctorProfile } from './doctor.entity';
import { User } from '../users/entity/user.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DoctorProfile,
      User,
    ]),
  ],
 controllers: [
  DoctorController,
  DoctorDiscoveryController
],
  providers: [DoctorService],
})
export class DoctorModule {}