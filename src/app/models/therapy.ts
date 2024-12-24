import { Employee } from './employee';
import { Patient } from './patient';
import { Location } from './location';

export interface Therapy {
  id?: number;
  name: string;
  patients: Patient[];
  leadingEmployee: Employee;
  location: Location;
  time: Date;
  preparationTime: number; // in minutes
  followUpTime: number;    // in minutes
}
