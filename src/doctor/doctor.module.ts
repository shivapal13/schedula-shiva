import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { DoctorController } from './doctor.controller';
import { DoctorService } from './doctor.service';

import { DoctorProfile } from './doctor.entity';
import { User } from '../users/entity/user.entities';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      DoctorProfile,
      User,
    ]),
  ],
  controllers: [DoctorController],
  providers: [DoctorService],
})
export class DoctorModule {}