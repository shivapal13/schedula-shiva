import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

export enum UserRole {
  DOCTOR = 'DOCTOR',
  PATIENT = 'PATIENT',
}
@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  username!: string;

  @Column({ unique: true })
  email!: string;

  @Column({
  select: false,
})
  password:string;

  @Column({
    type: 'enum',
    enum: UserRole,
  })
  role!: UserRole;
}