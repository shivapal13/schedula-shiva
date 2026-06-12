import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

import { DoctorProfile } from '../doctor/doctor.entity';

@Entity()
export class RecurringAvailability {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  dayOfWeek: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @ManyToOne(() => DoctorProfile)
  doctor: DoctorProfile;
}