import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PatientProfile } from './patient.entity';
import { User } from '../users/entity/user.entities';

@Injectable()
export class PatientService {
  constructor(
    @InjectRepository(PatientProfile)
    private patientRepo: Repository<PatientProfile>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(userId: number, dto: any) {
    const existing = await this.patientRepo.findOne({
      where: {
        user: { id: userId },
      },
    });

    if (existing) {
      throw new ConflictException('Profile already exists');
    }

    const user = await this.userRepo.findOneBy({
      id: userId,
    });

    const profile = this.patientRepo.create({
      ...dto,
      user,
    });

    return this.patientRepo.save(profile);
  }

  async get(userId: number) {
    const profile = await this.patientRepo.findOne({
      where: {
        user: { id: userId },
      },
    });

    if (!profile) {
      throw new NotFoundException('Profile not found');
    }

    return profile;
  }

  async update(userId: number, dto: any) {
    const profile = await this.get(userId);

    Object.assign(profile, dto);

    return this.patientRepo.save(profile);
  }
}