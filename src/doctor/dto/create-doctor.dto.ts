export class CreateDoctorDto {
  fullName: string;
  specialization: string;
  experience: number;
  qualification: string;
  consultationFee: number;
  availability: string;
  profileDetails?: string;
}