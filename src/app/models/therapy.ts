import { Employee } from './employee';
import { Patient } from './patient';

export interface Therapy {
  id?: number;
  name: string;
  patients: Patient[];
  leadingEmployee: Employee;
  location: string;
  time: Date;
  preparationTime: number; // in minutes
  followUpTime: number;    // in minutes
  therapyType: string;
}
