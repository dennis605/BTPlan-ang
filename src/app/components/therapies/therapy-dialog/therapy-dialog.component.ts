import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import moment from 'moment';
import { Therapy } from '../../../models/therapy';
import { Employee } from '../../../models/employee';
import { Patient } from '../../../models/patient';
import { Location } from '../../../models/location';
import { EmployeeService } from '../../../services/employee.service';
import { PatientService } from '../../../services/patient.service';
import { LocationService } from '../../../services/location.service';

@Component({
  selector: 'app-therapy-dialog',
  templateUrl: './therapy-dialog.component.html',
  styleUrls: ['./therapy-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatDatepickerModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'DD.MM.YYYY',
        },
        display: {
          dateInput: 'DD.MM.YYYY',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    }
  ]
})
export class TherapyDialogComponent {
  therapy: Therapy;
  employees: Employee[] = [];
  patients: Patient[] = [];
  locations: Location[] = [];
  selectedStartTime: string = '00:00';
  selectedEndTime: string = '00:00';

  constructor(
    private dateAdapter: DateAdapter<any>,
    public dialogRef: MatDialogRef<TherapyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { therapy?: Therapy },
    private employeeService: EmployeeService,
    private patientService: PatientService,
    private locationService: LocationService
  ) {
    this.therapy = data.therapy ? { ...data.therapy } : {
      name: '',
      patients: [],
      leadingEmployee: {} as Employee,
      location: {} as Location,
      startTime: new Date(),
      endTime: new Date(),
      preparationTime: 15,
      followUpTime: 15
    };

    // Initialisiere Start- und Endzeit aus therapy
    if (data.therapy) {
      const startTime = new Date(this.therapy.startTime);
      const endTime = new Date(this.therapy.endTime);
      this.selectedStartTime = `${startTime.getHours().toString().padStart(2, '0')}:${startTime.getMinutes().toString().padStart(2, '0')}`;
      this.selectedEndTime = `${endTime.getHours().toString().padStart(2, '0')}:${endTime.getMinutes().toString().padStart(2, '0')}`;
    }

    this.loadEmployees();
    this.loadPatients();
    this.loadLocations();
    moment.locale('de');
    this.dateAdapter.setLocale('de');
  }

  loadEmployees(): void {
    this.employeeService.getEmployees().subscribe(employees => {
      this.employees = employees;
    });
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe(patients => {
      this.patients = patients;
    });
  }

  loadLocations(): void {
    this.locationService.getLocations().subscribe(locations => {
      this.locations = locations;
    });
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.isValid()) {
      // Aktualisiere Start- und Endzeit
      const date = moment(this.therapy.startTime).format('YYYY-MM-DD');
      const [startHours, startMinutes] = this.selectedStartTime.split(':');
      const [endHours, endMinutes] = this.selectedEndTime.split(':');
      
      this.therapy.startTime = new Date(date + 'T' + this.selectedStartTime);
      this.therapy.endTime = new Date(date + 'T' + this.selectedEndTime);

      this.dialogRef.close(this.therapy);
    }
  }

  isValid(): boolean {
    return !!(
      this.therapy.name &&
      this.therapy.leadingEmployee?.id &&
      this.therapy.location?.id &&
      this.therapy.patients.length > 0 &&
      this.selectedStartTime &&
      this.selectedEndTime &&
      typeof this.therapy.preparationTime === 'number' && this.therapy.preparationTime >= 0 &&
      typeof this.therapy.followUpTime === 'number' && this.therapy.followUpTime >= 0
    );
  }

  compareLocations(location1: Location, location2: Location): boolean {
    return location1 && location2 ? location1.id === location2.id : location1 === location2;
  }

  compareEmployees(employee1: Employee, employee2: Employee): boolean {
    return employee1 && employee2 ? employee1.id === employee2.id : employee1 === employee2;
  }

  comparePatients(patient1: Patient, patient2: Patient): boolean {
    return patient1 && patient2 ? patient1.id === patient2.id : patient1 === patient2;
  }
}
