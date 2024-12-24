import { Routes } from '@angular/router';
import { EmployeeListComponent } from './components/employees/employee-list/employee-list.component';
import { PatientListComponent } from './components/patients/patient-list/patient-list.component';
import { TherapyListComponent } from './components/therapies/therapy-list/therapy-list.component';
import { DailyScheduleListComponent } from './components/daily-schedules/daily-schedule-list/daily-schedule-list.component';
import { LocationListComponent } from './components/locations/location-list/location-list.component';

export const routes: Routes = [
  { path: '', redirectTo: '/employees', pathMatch: 'full' },
  { path: 'employees', component: EmployeeListComponent },
  { path: 'patients', component: PatientListComponent },
  { path: 'therapies', component: TherapyListComponent },
  { path: 'schedule', component: DailyScheduleListComponent },
  { path: 'locations', component: LocationListComponent }
];
