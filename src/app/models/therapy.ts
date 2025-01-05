import { Employee } from './employee';
import { Patient } from './patient';
import { Location } from './location';

export interface Therapy {
  id: string;
  name: string;
  patients: Patient[];
  leadingEmployee: Employee;
  location: Location;
  startTime: string;          // ISO 8601 Format (YYYY-MM-DDTHH:mm:ss.sssZ)
  endTime: string;            // ISO 8601 Format (YYYY-MM-DDTHH:mm:ss.sssZ)
  preparationTime: number;     // in minutes
  followUpTime: number;        // in minutes
  comment?: string;            // optionales Kommentarfeld
}
