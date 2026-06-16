import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  Appointment,
  AppointmentStatus,
} from '../appointment/appointment.entity';
import { DoctorProfile } from './doctor.entity';
import { User } from '../users/entity/user.entities';
import { RecurringAvailability } from '../availability/recurring-availability.entity';
import { CustomAvailability } from '../availability/custom-availability.entity';
@Injectable()
export class DoctorService {
  constructor(
    @InjectRepository(DoctorProfile)
    private doctorRepo: Repository<DoctorProfile>,

    @InjectRepository(User)
    private userRepo: Repository<User>,
    @InjectRepository(RecurringAvailability)
private recurringRepo: Repository<RecurringAvailability>,
@InjectRepository(Appointment)
private appointmentRepo: Repository<Appointment>,

@InjectRepository(CustomAvailability)
private customRepo: Repository<CustomAvailability>,
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
private filterFutureSlots(
  slots: any[],
  date: string,
) {
  const now = new Date();

  return slots.filter((slot) => {
    const slotDateTime = new Date(
      `${date}T${slot.startTime}:00`,
    );

    return slotDateTime > now;
  });
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
async getSlots(
  doctorId: number,
  date: string,
  duration: number,
) {
  if (!date) {
    throw new BadRequestException(
      'Date is required',
    );
  }

  if (![10, 15, 30].includes(duration)) {
    throw new BadRequestException(
      'Invalid slot duration',
    );
  }
  const selectedDate = new Date(date);

if (isNaN(selectedDate.getTime())) {
  throw new BadRequestException(
    'Invalid date',
  );
}
const today = new Date();

today.setHours(0, 0, 0, 0);

if (selectedDate < today) {
  throw new BadRequestException(
    'Past date not allowed',
  );
}
  const doctor =
    await this.doctorRepo.findOne({
      where: { id: doctorId },
    });

  if (!doctor) {
    throw new NotFoundException(
      'Doctor not found',
    );
  }

  const custom =
    await this.customRepo.find({
      where: {
        doctor: { id: doctorId },
        date,
      },
    });

  if (custom.length > 0) {
    const slots:any[] = [];

    for (const item of custom) {
      slots.push(
        ...this.generateSlots(
          item.startTime,
          item.endTime,
          duration,
        ),
      );
    }
if (slots.length === 0) {
  throw new NotFoundException(
    'No slots available',
  );
}
   const futureSlots =
  this.filterFutureSlots(
    slots,
    date,
  );

if (futureSlots.length === 0) {
  throw new NotFoundException(
    'No future slots available',
  );
}

const bookedAppointments =
  await this.appointmentRepo.find({
    where: {
      doctor: { id: doctorId },
      date,
      status: AppointmentStatus.BOOKED,
    },
  });
const availableSlots =
  futureSlots.filter(
    (slot) =>
      !bookedAppointments.some(
        (appt) =>
          appt.startTime === slot.startTime &&
          appt.endTime === slot.endTime,
      ),
  );

return {
  source: 'custom',
  slots: availableSlots,
};
  }

  const dayOfWeek = new Date(date)
    .toLocaleDateString('en-US', {
      weekday: 'long',
    })
    .toUpperCase();

  const recurring =
    await this.recurringRepo.find({
      where: {
        doctor: { id: doctorId },
        dayOfWeek,
      },
    });
    if (recurring.length === 0) {
  throw new NotFoundException(
    'No availability found',
  );
}
  const slots:any[] = [];

for (const item of recurring) {
  slots.push(
    ...this.generateSlots(
      item.startTime,
      item.endTime,
      duration,
    ),
  );
}
if (slots.length === 0) {
  throw new NotFoundException(
    'No slots available',
  );
}
const futureSlots =
  this.filterFutureSlots(
    slots,
    date,
  );

if (futureSlots.length === 0) {
  throw new NotFoundException(
    'No future slots available',
  );
}

const bookedAppointments =
  await this.appointmentRepo.find({
    relations: ['doctor'],
  });

const doctorAppointments =
  bookedAppointments.filter(
    (appt) => appt.doctor?.id === doctorId,
  );
const availableSlots =
  futureSlots.filter(
    (slot) =>
      !doctorAppointments.some(
        (appt) =>
          appt.startTime === slot.startTime &&
          appt.endTime === slot.endTime,
      ),
    );
return  {
   source: 'recurring',
   slots: availableSlots,
 };
}
private generateSlots(
  startTime: string,
  endTime: string,
  duration: number,
) {
  const slots:any[] = [];

  let current =
    this.toMinutes(startTime);

  const end =
    this.toMinutes(endTime);

  while (current + duration <= end) {
    slots.push({
      startTime:
        this.toTime(current),
      endTime:
        this.toTime(
          current + duration,
        ),
    });

    current += duration;
  }
  return slots;
}
private toMinutes(time: string) {
  const [hours, minutes] =
    time.split(':').map(Number);

  return hours * 60 + minutes;
}

private toTime(minutes: number) {
  const hours = Math.floor(
    minutes / 60,
  );

  const mins = minutes % 60;

  return `${String(hours).padStart(
    2,
    '0',
  )}:${String(mins).padStart(
    2,
    '0',
  )}`;
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