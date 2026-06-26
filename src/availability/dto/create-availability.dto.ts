import { SchedulingType } from '../scheduling-type.enum';

export class CreateAvailabilityDto {
  dayOfWeek: string;

  startTime: string;

  endTime: string;

  schedulingType: SchedulingType;

  slotDuration?: number;

  bufferTime?: number;

  capacity?: number;
}