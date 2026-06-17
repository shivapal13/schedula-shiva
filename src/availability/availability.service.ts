import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CustomAvailability } from './custom-availability.entity';
import { DoctorProfile } from '../doctor/doctor.entity';
import { RecurringAvailability } from './recurring-availability.entity';
@Injectable()
export class AvailabilityService {
  constructor(
    @InjectRepository(DoctorProfile)
    private readonly doctorRepo: Repository<DoctorProfile>,

    @InjectRepository(RecurringAvailability)
    private readonly recurringRepo: Repository<RecurringAvailability>,

    @InjectRepository(CustomAvailability)
    private readonly customRepo: Repository<CustomAvailability>,
  ) {}

  async create(userId: number, dto: any) {
    const doctor = await this.doctorRepo.findOne({
      where: {
        user: { id: userId },
      },
      relations: ['user'],
    });

    if (!doctor) {
      throw new NotFoundException(
        'Doctor profile not found',
      );
    }

    if (dto.startTime >= dto.endTime) {
      throw new BadRequestException(
        'Invalid time range',
      );
    }

    const existing = await this.recurringRepo.find({
      where: {
        doctor: { id: doctor.id },
        dayOfWeek: dto.dayOfWeek,
      },
    });
    const duplicate =
      await this.recurringRepo.findOne({
        where: {
          doctor: { id: doctor.id },
          dayOfWeek: dto.dayOfWeek,
          startTime: dto.startTime,
          endTime: dto.endTime,
        },
      });

    if (duplicate) {
      throw new BadRequestException(
        'Duplicate availability slot',
      );
    }

    const overlap = existing.some(
      (slot) =>
        dto.startTime < slot.endTime &&
        dto.endTime > slot.startTime,
    );

    if (overlap) {
      throw new BadRequestException(
        'Availability slot overlaps with existing slot',
      );
    }


    const availability =
  this.recurringRepo.create({
    doctor,
    dayOfWeek: dto.dayOfWeek,
    startTime: dto.startTime,
    endTime: dto.endTime,

    schedulingType:
      dto.schedulingType,

    capacity: dto.capacity,

    bufferTime:
      dto.bufferTime || 0,
  });

const saved: any = await this.recurringRepo.save(
  availability,
);
    return {
    saved
};
  }

  async getAll(userId: number) {
    const doctor = await this.doctorRepo.findOne({
      where: {
        user: { id: userId },
      },
      relations: ['user'],
    });

    if (!doctor) {
      throw new NotFoundException(
        'Doctor profile not found',
      );
    }

    const availability =
      await this.recurringRepo.find({
        where: {
          doctor: { id: doctor.id },
        },
      });

    return {
      success: true,
      data: availability,
    };
  }
  async update(
  id: number,
  userId: number,
  dto: any,
) {
  const doctor =
    await this.doctorRepo.findOne({
      where: {
        user: { id: userId },
      },
      relations: ['user'],
    });

  if (!doctor) {
    throw new NotFoundException(
      'Doctor profile not found',
    );
  }
  if (
  dto.startTime &&
  dto.endTime &&
  dto.startTime >= dto.endTime
) {
  throw new BadRequestException(
    'Invalid time range',
  );
}

  const availability =
    await this.recurringRepo.findOne({
      where: {
        id,
        doctor: { id: doctor.id },
      },
    });

  if (!availability) {
    throw new NotFoundException(
      'Availability not found',
    );
  }

  Object.assign(
    availability,
    dto,
  );

  const updated =
    await this.recurringRepo.save(
      availability,
    );

  return {
    success: true,
    message:
      'Availability updated successfully',
    data: updated,
  };
}

async remove(
  id: number,
  userId: number,
) {
  const doctor =
    await this.doctorRepo.findOne({
      where: {
        user: { id: userId },
      },
      relations: ['user'],
    });

  if (!doctor) {
    throw new NotFoundException(
      'Doctor profile not found',
    );
  }

  const availability =
    await this.recurringRepo.findOne({
      where: {
        id,
        doctor: { id: doctor.id },
      },
    });

  if (!availability) {
    throw new NotFoundException(
      'Availability not found',
    );
  }

  await this.recurringRepo.remove(
    availability,
  );

  return {
    success: true,
    message:
      'Availability deleted successfully',
  };
}
async createOverride(
  userId: number,
  dto: any,
) {
  const doctor =
    await this.doctorRepo.findOne({
      where: {
        user: { id: userId },
      },
      relations: ['user'],
    });
  if (!doctor) {
    throw new NotFoundException(
      'Doctor profile not found',
    );
  }
  const override =
    this.customRepo.create({
      ...dto,
      doctor,
    });

  const saved: any =
    await this.customRepo.save(
      override,
    );

  return {
    success: true,
    message:
      'Custom availability created successfully',
    data: {
      id: saved.id,
      doctorId: doctor.id,
      date: saved.date,
      startTime: saved.startTime,
      endTime: saved.endTime,
    },
  };
  }
  async getByDate(userId: number, date: string) {
  const doctor = await this.doctorRepo.findOne({
    where: { user: { id: userId } },
    relations: ['user'],
  });

  if (!doctor) {
    throw new NotFoundException('Doctor profile not found');
  }

  const custom = await this.customRepo.find({
    where: {
      doctor: { id: doctor.id },
      date,
    },
  });

  if (custom.length > 0) {
    return {
      source: 'custom',
      data: custom,
    };
  }

  const dayOfWeek = new Date(date)
    .toLocaleDateString('en-US', {
      weekday: 'long',
    })
    .toUpperCase();

  const recurring = await this.recurringRepo.find({
    where: {
      doctor: { id: doctor.id },
      dayOfWeek,
    },
  });

  return {
    source: 'recurring',
    data: recurring,
  };
}
}