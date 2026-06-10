import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
} from 'typeorm';

import { User } from '../users/entity/user.entities';

@Entity()
export class DoctorProfile {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  fullName: string;

  @Column()
  specialization: string;

  @Column()
  experience: number;

  @Column()
  qualification: string;

  @Column('decimal')
  consultationFee: number;

  @Column()
  availability: string;

  @Column({ nullable: true })
  profileDetails: string;

  @OneToOne(() => User)
  @JoinColumn()
  user: User;
}