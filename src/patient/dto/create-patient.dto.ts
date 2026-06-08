export class CreatePatientDto {
  fullName: string;
  age: number;
  gender: string;
  contactDetails: string;
  healthInfo?: string;
}