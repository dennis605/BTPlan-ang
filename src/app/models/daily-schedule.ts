import { Therapy } from './therapy';

export interface DailySchedule {
  id: string;
  date: string;  // ISO 8601 Format (YYYY-MM-DDTHH:mm:ss.sssZ)
  therapies: Therapy[];
}
