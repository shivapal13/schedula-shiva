import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../users/entity/user.entities';

@Entity('patient_profile')
export class PatientProfile{
@PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  age: number;

  @Column()
  gender: string;

  @Column()
  contactDetails: string;

  @Column({ nullable: true })
  healthInfo: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}