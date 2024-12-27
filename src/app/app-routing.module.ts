import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { DailyScheduleListComponent } from './components/daily-schedules/daily-schedule-list/daily-schedule-list.component';
import { DailySchedulePrintComponent } from './components/daily-schedules/daily-schedule-print/daily-schedule-print.component';
import { PatientListComponent } from './components/patients/patient-list/patient-list.component';
import { EmployeeListComponent } from './components/employees/employee-list/employee-list.component';
import { TherapyListComponent } from './components/therapies/therapy-list/therapy-list.component';

const routes: Routes = [
  { path: '', redirectTo: '/daily-schedule', pathMatch: 'full' },
  { path: 'daily-schedule', component: DailyScheduleListComponent },
  { path: 'daily-schedule/print', component: DailySchedulePrintComponent },
  { path: 'patients', component: PatientListComponent },
  { path: 'employees', component: EmployeeListComponent },
  { path: 'therapies', component: TherapyListComponent }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
