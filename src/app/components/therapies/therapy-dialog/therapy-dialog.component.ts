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
import dayjs from 'dayjs';
import { Therapy } from '../../../models/therapy';
import { Employee } from '../../../models/employee';
import { Patient } from '../../../models/patient';
import { Location } from '../../../models/location';
import { EmployeeService } from '../../../services/employee.service';
import { PatientService } from '../../../services/patient.service';
import { LocationService } from '../../../services/location.service';

@Component({
  selector: 'app-therapy-dialog',
  template: `
    <h2 mat-dialog-title>{{data.therapy ? 'Therapie bearbeiten' : 'Neue Therapie'}}</h2>
    <mat-dialog-content>
      <form #therapyForm="ngForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Programmname</mat-label>
          <input matInput [(ngModel)]="therapy.name" name="name" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Datum</mat-label>
          <input matInput [matDatepicker]="picker" [(ngModel)]="selectedDate" name="date" required>
          <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
          <mat-datepicker #picker></mat-datepicker>
        </mat-form-field>

        <div class="time-inputs">
          <mat-form-field appearance="fill">
            <mat-label>Startzeit</mat-label>
            <input matInput type="time" [(ngModel)]="selectedStartTime" name="startTime" required>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Endzeit</mat-label>
            <input matInput type="time" [(ngModel)]="selectedEndTime" name="endTime" required>
          </mat-form-field>
        </div>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Mitarbeiter</mat-label>
          <mat-select [(ngModel)]="therapy.leadingEmployee" name="leadingEmployee" required
                    [compareWith]="compareEmployees">
            <mat-option *ngFor="let employee of employees" [value]="employee">
              {{employee.name}} {{employee.surname}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Bewohner</mat-label>
          <mat-select [(ngModel)]="therapy.patients" name="patients" multiple required
                    [compareWith]="comparePatients">
            <mat-option *ngFor="let patient of patients" [value]="patient">
              {{patient.name}} {{patient.surname}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Ort</mat-label>
          <mat-select [(ngModel)]="therapy.location" name="location" required
                    [compareWith]="compareLocations">
            <mat-option *ngFor="let location of locations" [value]="location">
              {{location.name}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <div class="time-inputs">
          <mat-form-field appearance="fill">
            <mat-label>Vorbereitungszeit (Min)</mat-label>
            <input matInput type="number" [(ngModel)]="therapy.preparationTime" name="preparationTime" required>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Nachbereitungszeit (Min)</mat-label>
            <input matInput type="number" [(ngModel)]="therapy.followUpTime" name="followUpTime" required>
          </mat-form-field>
        </div>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Kommentar</mat-label>
          <textarea matInput [(ngModel)]="therapy.comment" name="comment" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Abbrechen</button>
      <button mat-raised-button color="primary" 
              (click)="onSave()" 
              [disabled]="!isValid()">
        Speichern
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    .time-inputs {
      display: flex;
      gap: 15px;
      margin-bottom: 15px;
    }
    mat-form-field {
      width: 100%;
    }
    textarea {
      min-height: 100px;
    }
  `],
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
  selectedDate: Date;

  constructor(
    private dateAdapter: DateAdapter<any>,
    public dialogRef: MatDialogRef<TherapyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { therapy?: Therapy },
    private employeeService: EmployeeService,
    private patientService: PatientService,
    private locationService: LocationService
  ) {
    this.therapy = data.therapy ? { ...data.therapy } : {
      id: crypto.randomUUID(),
      name: '',
      patients: [],
      leadingEmployee: {} as Employee,
      location: {} as Location,
      startTime: dayjs().startOf('hour').toISOString(),
      endTime: dayjs().startOf('hour').add(1, 'hour').toISOString(),
      preparationTime: 15,
      followUpTime: 15
    };

    // Initialisiere Start- und Endzeit aus therapy
    if (data.therapy) {
      const startTime = dayjs(this.therapy.startTime);
      const endTime = dayjs(this.therapy.endTime);
      this.selectedDate = startTime.toDate();
      this.selectedStartTime = startTime.format('HH:mm');
      this.selectedEndTime = endTime.format('HH:mm');
    } else {
      this.selectedDate = new Date();
    }

    this.loadEmployees();
    this.loadPatients();
    this.loadLocations();
    dayjs.locale('de');
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
      const [startHours, startMinutes] = this.selectedStartTime.split(':').map(Number);
      const [endHours, endMinutes] = this.selectedEndTime.split(':').map(Number);
      
      const startDate = dayjs(this.selectedDate)
        .hour(startHours)
        .minute(startMinutes)
        .second(0)
        .millisecond(0);

      const endDate = dayjs(this.selectedDate)
        .hour(endHours)
        .minute(endMinutes)
        .second(0)
        .millisecond(0);

      this.therapy.startTime = startDate.toISOString();
      this.therapy.endTime = endDate.toISOString();

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
