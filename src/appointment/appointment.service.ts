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
import { Notification,NotificationType } from '../notification/notification.entity';
import { NotificationService } from '../notification/notification.service';
@Injectable()
export class AppointmentService {
  constructor(
    private notificationService:
      NotificationService,
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
  const bookingDate=new Date(dto.date);
  if (
  isNaN(bookingDate.getTime())
) {
  throw new BadRequestException(
    'Invalid date format',
  );
}
const today = new Date();

const todayDate =
  today.toLocaleDateString('en-CA');

if (dto.date !== todayDate) {
  throw new BadRequestException(
    'Appointments can only be booked for today',
  );
}
  const existingSameDayAppointment =
  await this.appointmentRepo.findOne({
    where: {
      patient: {
        id: patient.id,
      },
      doctor: {
        id: dto.doctorId,
      },
      date: dto.date,
      status:
        AppointmentStatus.BOOKED,
    },
  });

if (existingSameDayAppointment) {
  throw new BadRequestException(
    `You already have an appointment with ${doctor.fullName} on this ${existingSameDayAppointment.date}`,
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
if (availabilities.length==0) {
  throw new BadRequestException(
    'Doctor is unavailable today',
  );
}
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
const consultationStart =
  new Date(
    `${dto.date}T${availability.startTime}:00`,
  );

const consultationEnd =
  new Date(
    `${dto.date}T${availability.endTime}:00`,
  );
  if (
  consultationStart >= consultationEnd
) {
  throw new BadRequestException(
    'Invalid consultation timings',
  );
}
const bookingOpen =
  new Date(
    consultationStart.getTime() -
      2 * 60 * 60 * 1000,
  );
const bookingClose =
  new Date(
    consultationEnd.getTime() -
      1 * 60 * 60 * 1000,
  );

  const now = new Date();
  if (now < bookingOpen) {
  throw new BadRequestException(
    'Booking window has not opened yet',
  );
}

if (now > bookingClose) {
  throw new BadRequestException(
    'Booking window has closed for today',
  );
}
let tokenNumber: number | undefined;

if (
  availability.schedulingType ===
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
    const suggestion =
      await this.findNextAvailableSlot(
        dto.doctorId,
        dto.date,
        availability.schedulingType
      );

    if (!suggestion) {
      throw new BadRequestException(
        'No appointments available in the next 30 working days',
      );
    }

    throw new BadRequestException({
      message: 'Wave is full',
      nextAvailable:
        suggestion,
    });
  }
  tokenNumber = bookedCount + 1;
}
if (
  availability.schedulingType !==
  SchedulingType.WAVE
) {
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
  });
  if (existing) {
    const suggestion =
      await this.findNextAvailableSlot(
        dto.doctorId,
        dto.date,
        availability.schedulingType,
        dto.startTime,
        dto.endTime
      );

    if (!suggestion) {
      throw new BadRequestException(
        'No appointments available in the next 30 working days',
      );
    }

    throw new BadRequestException({
      message:
        'Requested slot unavailable',
      nextAvailable:
        suggestion,
    });
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
    schedulingType:availability.schedulingType,
    status:
      AppointmentStatus.BOOKED,
  });

const saved =
  await this.appointmentRepo.save(
    appointment,
  );

await this.notificationService
  .createNotification(
    patient,
    'Appointment Booked',
    `Your appointment with Dr. ${doctor.fullName} has been booked successfully for ${dto.date} at ${dto.startTime}.`,
    NotificationType.APPOINTMENT_BOOKED,
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
  date?: string,
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
  if (
  date &&
  isNaN(Date.parse(date))
) {
  throw new BadRequestException(
    'Invalid date format',
  );
}

 const where: any = {
  doctor: {
    id: doctor.id,
  },
  status:
    AppointmentStatus.BOOKED,
};

if (date) {
  where.date = date;
}
const appointments =
  await this.appointmentRepo.find({
    where,
    relations: [
      'patient',
      'patient.user',
    ],
  });
  if (appointments.length === 0) {
  throw new NotFoundException(
    'No appointments found',
  );
}
const result = await Promise.all(
  appointments.map(
    async (appointment) => {
      const dayOfWeek = new Date(
        appointment.date,
      )
        .toLocaleDateString(
          'en-US',
          {
            weekday: 'long',
          },
        )
        .toUpperCase();
const availabilities =
  await this.recurringRepo.find({
    where: {
      doctor: { id: doctor.id },
      dayOfWeek,
    },
  });
     const availability =
      availabilities.find(
    (a) =>
      appointment.startTime >= a.startTime &&
      appointment.endTime <= a.endTime,
  );

      return {
        ...appointment,
        schedulingType:
          availability
            ?.schedulingType,
      };
    },
  ),
);
return result;
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

  await this.notificationService
  .createNotification(
    appointment.patient,
    'Appointment Cancelled',
    `Your appointment scheduled on ${appointment.date} at ${appointment.startTime} has been cancelled.`,
    NotificationType.APPOINTMENT_CANCELLED,
  );

  return {
    success: true,
    message:
      'Appointment cancelled successfully',
  };
}
async cancelAppointmentByDoctor(
  appointmentId: number,
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

const appointment =
  await this.appointmentRepo.findOne({
    where: {
      id: appointmentId,
    },
    relations: [
      'doctor',
      'patient',
    ],
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

  if (
    appointment.doctor.id !==
    doctor.id
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
        availability.schedulingType,
        dto.startTime,
        dto.endTime
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
await this.notificationService
  .createNotification(
    appointment.patient,
    'Appointment Rescheduled',
    `Your appointment has been rescheduled to ${dto.startDate} at ${dto.startTime}.`,
    NotificationType.APPOINTMENT_RESCHEDULED,
  );

return {
  success: true,
  message:
    'Appointment rescheduled successfully',
  data: appointment,
};
}
private timeToMinutes(
  time: string,
): number {
  const [hours, minutes] =
    time.split(':').map(Number);

  return hours * 60 + minutes;
}

private minutesToTime(
  minutes: number,
): string {
  const hours = Math.floor(
    minutes / 60,
  );

  const mins = minutes % 60;

  return `${hours
    .toString()
    .padStart(2, '0')}:${mins
    .toString()
    .padStart(2, '0')}`;
}
private async findNextAvailableSlot(
  doctorId: number,
  startDate: string,
  schedulingType:SchedulingType,
  requestedStartTime?: string,
  requestedEndTime?: string,
) {
  const baseDate =
    new Date(startDate);

  for (
    let i = 0;
    i <= 30;
    i++
  ) {
    const currentDate =
      new Date(baseDate);

    currentDate.setDate(
      currentDate.getDate() + i,
    );
  const date = currentDate
  .toLocaleDateString('sv-SE');

    const dayOfWeek =
      currentDate
        .toLocaleDateString(
          'en-US',
          {
            weekday: 'long',
          },
        )
        .toUpperCase();

   const availabilities =
  await this.recurringRepo.find({
    where: {
      doctor: {
        id: doctorId,
      },
      dayOfWeek,
      schedulingType
    },
  });
if (
  availabilities.length === 0
) {
  continue;
}

    for (const availability of availabilities) {

      if (
        availability.schedulingType ===
        SchedulingType.WAVE
      ) {
        const bookedCount =
  await this.appointmentRepo.count({
    where: {
      doctor: {
        id: doctorId,
      },
      date,
      status:
        AppointmentStatus.BOOKED,
    },
  });
        if (
          bookedCount <
          availability.capacity
        ) {
          return {
            date,
            startTime:
              availability.startTime,
            endTime:
              availability.endTime,
            schedulingType:
              availability.schedulingType,
          };
        }
      }
      if (
        availability.schedulingType ===
        SchedulingType.STREAM
      ) {
      const startMinutes =
        date === startDate &&
       requestedEndTime
    ? this.timeToMinutes(
        requestedEndTime,
      )
    : this.timeToMinutes(
        availability.startTime,
      );

        const endMinutes =
          this.timeToMinutes(
            availability.endTime,
          );

       const slotDuration =
       availability.slotDuration || 15;

        for (
          let current =
            startMinutes;
          current + slotDuration <=
          endMinutes;
          current +=
         slotDuration +
          (availability.bufferTime || 0)
        ) {
          const slotStart =
            this.minutesToTime(
              current,
            );

          const slotEnd =
            this.minutesToTime(
              current +
                slotDuration,
            );
              if (
              date === startDate &&
              slotStart ===
                requestedStartTime &&
              slotEnd ===
                requestedEndTime
            ) {
              continue;
            }

          const existing =
            await this.appointmentRepo.findOne({
              where: {
                doctor: {
                  id: doctorId,
                },
                date,
                startTime:
                  slotStart,
                endTime:
                  slotEnd,
                status:
                  AppointmentStatus.BOOKED,
              },
            });

          if (!existing) {
            return {
              date,
              startTime:
                slotStart,
              endTime:
                slotEnd,
              schedulingType:
                SchedulingType.STREAM,
            };
          }
        }
      }
    }
  }
return null;
}
}

