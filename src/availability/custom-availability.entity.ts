import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';

import { DoctorProfile } from '../doctor/doctor.entity';
import { SchedulingType } from './scheduling-type.enum';
@Entity('custom_availability')
export class CustomAvailability {
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
  enum: SchedulingType,
  default: SchedulingType.STREAM,
})
schedulingType: SchedulingType;

@Column({
  nullable: true,
})
bufferTime: number;

@Column({
  nullable: true,
})
capacity: number;


  @ManyToOne(() => DoctorProfile)
  doctor: DoctorProfile;
}