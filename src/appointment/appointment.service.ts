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
import { RescheduleAppointmentDto } from './dto/reschedule-appointment.dto';
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

const availabilities =
  await this.recurringRepo.find({
    where: {
      doctor: {
        id:dto.doctorId,
      },
      dayOfWeek,
    },
  });

const availability =
  availabilities.find(
    (a) =>
      dto.startTime >= a.startTime &&
      dto.endTime <= a.endTime,
  );

if (!availability) {
  throw new BadRequestException(
    'Requested slot does not exist',
  );
}
 
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

return appointments;
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
const diff =
  appointmentDateTime.getTime() -
  Date.now();

if (
  diff <
  30 * 60 * 1000
) {
  throw new BadRequestException(
    'Cancellation not allowed within 30 minutes',
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
async rescheduleAppointment(
  appointmentId: number,
  userId: number,
  dto: any,
) {
const appointment =
  await this.appointmentRepo.findOne({
    where: {
      id: appointmentId,
    },
    relations: [
      'patient',
      'doctor',
    ],
  });

if (!appointment) {
  throw new NotFoundException(
    'Appointment not found',
  );
}
const patient =
  await this.patientRepo.findOne({
    where: {
      user: {
        id: userId,
      },
    },
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
    'Cancelled appointment cannot be rescheduled',
  );
}
if (
  appointment.date === dto.date &&
  appointment.startTime === dto.startTime &&
  appointment.endTime === dto.endTime
) {
  throw new BadRequestException(
    'Cannot reschedule to same slot',
  );
}
const newAppointmentTime =
  new Date(
    `${dto.date}T${dto.startTime}:00`,
  );

if (
  newAppointmentTime <=
  new Date()
) {
  throw new BadRequestException(
    'Cannot reschedule to past slot',
  );
}
const currentAppointmentTime =
  new Date(
    `${appointment.date}T${appointment.startTime}:00`,
  );

const diff =
  currentAppointmentTime.getTime() -
  Date.now();

if (
  diff <
  30 * 60 * 1000
) {
  throw new BadRequestException(
    'Reschedule not allowed within 30 minutes',
  );
}
const dayOfWeek = new Date(dto.date)
  .toLocaleDateString('en-US', {
    weekday: 'long',
  })
  .toUpperCase();

const availabilities =
  await this.recurringRepo.find({
    where: {
      doctor: {
        id: appointment.doctor.id,
      },
      dayOfWeek,
    },
  });

const availability =
  availabilities.find(
    (a) =>
      dto.startTime >= a.startTime &&
      dto.endTime <= a.endTime,
  );

if (!availability) {
  throw new BadRequestException({
    message:
      'Doctor unavailable on requested day',
    suggestedSlot: null,
  });
}
const existing =
    await this.appointmentRepo.findOne({
      where: {
        doctor: {
          id:
            appointment.doctor.id,
        },
        date: dto.date,
        startTime: dto.startTime,
        endTime: dto.endTime,
        status:
          AppointmentStatus.BOOKED,
      },
    });
if (
  availability.schedulingType ===
  SchedulingType.WAVE
) {
  const bookedCount =
    await this.appointmentRepo.count({
      where: {
        doctor: {
          id:
            appointment.doctor.id,
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
){
  const otherWave =
  await this.recurringRepo.findOne({
    where: {
      doctor: {
        id:
          appointment.doctor.id,
      },
      schedulingType:
        SchedulingType.WAVE,
    },
  });
throw new BadRequestException({
  message: 'Wave is full',
  suggestedWave: otherWave
    ? {
        startTime:
          otherWave.startTime,
        endTime:
          otherWave.endTime,
        capacity:
          otherWave.capacity,
      }
    : null,
});
}
  appointment.tokenNumber =
    bookedCount + 1;
}
if (
  availability.schedulingType ===
  SchedulingType.STREAM
) {
  if (existing) {
    const suggestion =
      await this.findNextAvailableSlot(
        appointment.doctor.id,
        dto.date,
      );

    throw new BadRequestException({
      message:
        'Requested slot unavailable',
      suggestedSlot:
        suggestion,
    });
  }
}
appointment.date = dto.date;
appointment.startTime =
  dto.startTime;
appointment.endTime =
  dto.endTime;

if (
  availability.schedulingType ===
  SchedulingType.STREAM
) {
  appointment.tokenNumber = null;
}

await this.appointmentRepo.save(
  appointment,
);

return {
  success: true,
  message:
    'Appointment rescheduled successfully',
  data: appointment,
};
}

private async findNextAvailableSlot(
  doctorId: number,
  date: string,
) {
  const dayOfWeek = new Date(date)
    .toLocaleDateString('en-US', {
      weekday: 'long',
    })
    .toUpperCase();

  const availability =
    await this.recurringRepo.findOne({
      where: {
        doctor: { id: doctorId },
        dayOfWeek,
        schedulingType:
          SchedulingType.STREAM,
      },
    });

  if (!availability) {
    return null;
  }

  return {
    startTime:
      availability.startTime,
    endTime:
      availability.endTime,
  };
}
}
