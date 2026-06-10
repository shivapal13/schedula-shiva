import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { DoctorProfile } from './doctor.entity';
import { User } from '../users/entity/user.entities';

@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(DoctorProfile)
    private doctorRepo: Repository<DoctorProfile>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
  ) {}

  async create(userId: number, dto: any) {
    const existing =
      await this.doctorRepo.findOne({
        where: {
          user: { id: userId },
        },
      });

    if (existing) {
      throw new ConflictException(
        'Profile already exists',
      );
    }

    const user =
      await this.userRepo.findOneBy({
        id: userId,
      });

    const profile =
      this.doctorRepo.create({
        ...dto,
        user,
      });

    return this.doctorRepo.save(profile);
  }

  async get(userId: number) {
    const profile =
      await this.doctorRepo.findOne({
        where: {
          user: { id: userId },
        },
      });

    if (!profile) {
      throw new NotFoundException(
        'Profile not found',
      );
    }

    return profile;
  }

  async update(userId: number, dto: any) {
    const profile =
      await this.get(userId);

    Object.assign(profile, dto);

    return this.doctorRepo.save(profile);
  }
async findAll(filters: any) {
  const {
    page = 1,
    limit = 10,
    search,
    specialization,
  } = filters;

  if (page < 1 || limit < 1) {
    throw new BadRequestException(
      'Invalid pagination values',
    );
  }

  const query =
    this.doctorRepo.createQueryBuilder(
      'doctor',
    );

  if (search) {
    query.andWhere(
      'LOWER(doctor.fullName) LIKE LOWER(:search)',
      {
        search: `%${search}%`,
      },
    );
  }

  if (specialization) {
    query.andWhere(
      'LOWER(doctor.specialization) = LOWER(:specialization)',
      {
        specialization,
      },
    );
  }

  query.skip((page - 1) * limit);
  query.take(limit);

  const [data, total] =
    await query.getManyAndCount();

  return {
    total,
    page,
    limit,
    data,
  };
}

async findOne(id: number) {
  if (isNaN(id)) {
    throw new BadRequestException(
      'Invalid doctor id',
    );
  }

  const doctor =
    await this.doctorRepo.findOne({
      where: { id },
    });

  if (!doctor) {
    throw new NotFoundException(
      'Doctor not found',
    );
  }

  return doctor;
}
}