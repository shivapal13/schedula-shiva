import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

import { DoctorProfile } from '../doctor/doctor.entity';
import { PatientProfile } from '../patient/patient.entity';
import { SchedulingType } from '../availability/scheduling-type.enum';

export enum AppointmentStatus {
  BOOKED = 'BOOKED',
  CANCELLED = 'CANCELLED',
}

@Entity('appointments')
export class Appointment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @Column({
    type: 'enum',
    enum: AppointmentStatus,
    default: AppointmentStatus.BOOKED,
  })
  status: AppointmentStatus;

  @Column({
  type: 'enum',
  enum: SchedulingType,
})
schedulingType: SchedulingType;

@Column({
  default: false,
})
reminderSent: boolean;
  
  @Column({
    type: 'integer',
  nullable: true,
})
tokenNumber: number | null;

  @ManyToOne(() => DoctorProfile)
  doctor: DoctorProfile;

  @ManyToOne(() => PatientProfile)
  patient: PatientProfile;
}