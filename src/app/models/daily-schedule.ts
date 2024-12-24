import { Therapy } from './therapy';

export interface DailySchedule {
  id?: number;
  date: Date;
  therapies: Therapy[];
}
