import {
  Param,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import {
  AppointmentStatus,
} from './appointment.entity';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Appointment } from './appointment.entity';;
import { RecurringAvailability } from '../availability/recurring-availability.entity';
import { SchedulingType } from '../availability/scheduling-type.enum';
import { DoctorProfile } from '../doctor/doctor.entity';
import { PatientProfile } from '../patient/patient.entity';

@Injectable()
export class AppointmentService {
  constructor(
    @InjectRepository(Appointment)
    private appointmentRepo: Repository<Appointment>,

    @InjectRepository(DoctorProfile)
    private doctorRepo: Repository<DoctorProfile>,

    @InjectRepository(PatientProfile)
    private patientRepo: Repository<PatientProfile>,

     @InjectRepository(RecurringAvailability)
     private recurringRepo: Repository<RecurringAvailability>,
  ) {}

async bookAppointment(
  userId: number,
  dto: any,
) {
  const patient =
    await this.patientRepo.findOne({
      where: {
        user: { id: userId },
      },
      relations: ['user'],
    });

  if (!patient) {
    throw new NotFoundException(
      'Patient profile not found',
    );
  }
    const doctor =
    await this.doctorRepo.findOne({
      where: {
        id: dto.doctorId,
      },
    });

  if (!doctor) {
    throw new NotFoundException(
      'Doctor not found',
    );
  }
  const appointmentDateTime = new Date(
  `${dto.date}T${dto.startTime}:00`,
);

if (appointmentDateTime <= new Date()) {
  throw new BadRequestException(
    'Cannot book past appointment',
  );
}
const dayOfWeek = new Date(dto.date)
  .toLocaleDateString('en-US', {
    weekday: 'long',
  })
  .toUpperCase();
const availability =
  await this.recurringRepo.findOne({
    where: {
      doctor: {
        id: dto.doctorId,
      },
      dayOfWeek,
      startTime: dto.startTime,
      endTime: dto.endTime,
    },
  });

let tokenNumber: number | undefined;

if (
  availability?.schedulingType ===
  SchedulingType.WAVE
) {

   const existingPatientBooking =
    await this.appointmentRepo.findOne({
      where: {
        patient: {
          id: patient.id,
        },
        doctor: {
          id: dto.doctorId,
        },
        date: dto.date,
        startTime: dto.startTime,
        endTime: dto.endTime,
        status:
          AppointmentStatus.BOOKED,
      },
    });

  if (existingPatientBooking) {
    throw new BadRequestException(
      'You already booked this wave',
    );
  }
  const bookedCount =
    await this.appointmentRepo.count({
      where: {
        doctor: {
          id: dto.doctorId,
        },
        date: dto.date,
        startTime: dto.startTime,
        endTime: dto.endTime,
        status:
          AppointmentStatus.BOOKED,
      },
    });

  if (
    bookedCount >=
    availability.capacity
  ) {
    throw new BadRequestException(
      'Wave is full',
    );
  }

  tokenNumber = bookedCount + 1;
}
  const existing =
    await this.appointmentRepo.findOne({
      where: {
        doctor: {
          id: dto.doctorId,
        },
        date: dto.date,
        startTime: dto.startTime,
        endTime: dto.endTime,
        status:
          AppointmentStatus.BOOKED,
      },
      relations: ['doctor'],
    });

  if (
  availability?.schedulingType !==
  SchedulingType.WAVE
) {
  if (existing) {
    throw new BadRequestException(
      'Slot already booked',
    );
  }
}

  const appointment =
    this.appointmentRepo.create({
      date: dto.date,
      startTime: dto.startTime,
      endTime: dto.endTime,
      doctor,
      patient,
      tokenNumber,
      status:
        AppointmentStatus.BOOKED,
    });

  const saved =
    await this.appointmentRepo.save(
      appointment,
    );

  return {
    success: true,
    message:
      'Appointment booked successfully',
    data: saved,
  };
}
async getMyAppointments(
  userId: number,
) {
  const patient =
    await this.patientRepo.findOne({
      where: {
        user: { id: userId },
      },
    });

  if (!patient) {
    throw new NotFoundException(
      'Patient profile not found',
    );
  }

  const appointments =
    await this.appointmentRepo.find({
      where: {
        patient: {
          id: patient.id,
        },
      },
      relations: [
        'doctor',
      ],
    });


if (appointments.length === 0) {
  throw new NotFoundException(
    'No appointments found',
  );
}

return appointments;;
}
async getDoctorAppointments(
  userId: number,
) {
  const doctor =
    await this.doctorRepo.findOne({
      where: {
        user: { id: userId },
      },
    });

  if (!doctor) {
    throw new NotFoundException(
      'Doctor profile not found',
    );
  }

 const appointments =
  await this.appointmentRepo.find({
    where: {
      doctor: {
        id: doctor.id,
      },
    },
    relations: [
      'patient',
    ],
  });

if (appointments.length === 0) {
  throw new NotFoundException(
    'No appointments found',
  );
}

return appointments;
}
async cancelAppointment(
  appointmentId: number,
  userId: number,
) {
  const appointment =
    await this.appointmentRepo.findOne({
      where: {
        id: appointmentId,
      },
      relations: ['patient'],
    });

  if (!appointment) {
    throw new NotFoundException(
      'Appointment not found',
    );
  }
  const appointmentDateTime = new Date(
  `${appointment.date}T${appointment.startTime}:00`,
);

if (appointmentDateTime < new Date()) {
  throw new BadRequestException(
    'Past appointment cannot be cancelled',
  );
}

  const patient =
    await this.patientRepo.findOne({
      where: {
        user: { id: userId },
      },
      relations: ['user'],
    });

  if (!patient) {
    throw new NotFoundException(
      'Patient profile not found',
    );
  }

  if (
    appointment.patient.id !==
    patient.id
  ) {
    throw new BadRequestException(
      'Unauthorized access',
    );
  }

  if (
    appointment.status ===
    AppointmentStatus.CANCELLED
  ) {
    throw new BadRequestException(
      'Appointment already cancelled',
    );
  }

  appointment.status =
    AppointmentStatus.CANCELLED;

  await this.appointmentRepo.save(
    appointment,
  );

  return {
    success: true,
    message:
      'Appointment cancelled successfully',
  };
}
}