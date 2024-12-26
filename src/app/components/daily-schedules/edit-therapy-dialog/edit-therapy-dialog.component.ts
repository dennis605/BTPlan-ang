import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { Therapy } from '../../../models/therapy';
import { MatChipsModule } from '@angular/material/chips';
import { Employee } from '../../../models/employee';
import { Patient } from '../../../models/patient';
import type { Location } from '../../../models/location';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { EmployeeService } from '../../../services/employee.service';
import { PatientService } from '../../../services/patient.service';
import { LocationService } from '../../../services/location.service';

@Component({
  selector: 'app-edit-therapy-dialog',
  template: `
    <h2 mat-dialog-title>Therapie bearbeiten</h2>
    <mat-dialog-content>
      <form #therapyForm="ngForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Name</mat-label>
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
            <input matInput type="time" [(ngModel)]="startTime" name="startTime" required>
          </mat-form-field>

          <mat-form-field appearance="fill">
            <mat-label>Endzeit</mat-label>
            <input matInput type="time" [(ngModel)]="endTime" name="endTime" required>
          </mat-form-field>
        </div>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Leitender Mitarbeiter</mat-label>
          <mat-select [(ngModel)]="therapy.leadingEmployee" name="leadingEmployee" required 
                    [compareWith]="compareById">
            <mat-option *ngFor="let employee of employees" [value]="employee">
              {{employee.name}} {{employee.surname}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Patienten</mat-label>
          <mat-select [(ngModel)]="therapy.patients" name="patients" multiple required
                    [compareWith]="compareById">
            <mat-option *ngFor="let patient of patients" [value]="patient">
              {{patient.name}} {{patient.surname}}
            </mat-option>
          </mat-select>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Ort</mat-label>
          <mat-select [(ngModel)]="therapy.location" name="location" required
                    [compareWith]="compareById">
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
              [disabled]="!therapyForm.form.valid">
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
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    FormsModule,
    MatDialogModule,
    MatChipsModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class EditTherapyDialogComponent implements OnInit {
  therapy: Therapy;
  startTime: string;
  endTime: string;
  selectedDate: Date;
  employees: Employee[] = [];
  patients: Patient[] = [];
  locations: Location[] = [];

  constructor(
    private dialogRef: MatDialogRef<EditTherapyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { therapy: Therapy },
    private employeeService: EmployeeService,
    private patientService: PatientService,
    private locationService: LocationService
  ) {
    console.log('Dialog data:', data);
    // Deep clone the therapy object to avoid modifying the original
    this.therapy = {
      ...data.therapy,
      location: { ...data.therapy.location },
      leadingEmployee: { ...data.therapy.leadingEmployee },
      patients: data.therapy.patients.map(p => ({ ...p }))
    };
    
    // Set the date and time fields
    const startDate = new Date(this.therapy.startTime);
    const endDate = new Date(this.therapy.endTime);
    
    this.selectedDate = new Date(startDate);
    this.startTime = startDate.toTimeString().slice(0, 5);
    this.endTime = endDate.toTimeString().slice(0, 5);
    
    console.log('Initialized therapy:', this.therapy);
  }

  ngOnInit() {
    // Load employees and preselect the current one
    this.employeeService.getEmployees().subscribe(employees => {
      this.employees = employees;
      // Find and select the current employee
      const currentEmployee = employees.find(e => e.id === this.therapy.leadingEmployee.id);
      if (currentEmployee) {
        this.therapy.leadingEmployee = currentEmployee;
      }
    });

    // Load patients and preselect the current ones
    this.patientService.getPatients().subscribe(patients => {
      this.patients = patients;
      // Find and select the current patients
      const currentPatients = this.therapy.patients.map(p => 
        patients.find(patient => patient.id === p.id)
      ).filter(p => p) as Patient[];
      if (currentPatients.length) {
        this.therapy.patients = currentPatients;
      }
    });

    // Load locations and preselect the current one
    this.locationService.getLocations().subscribe(locations => {
      this.locations = locations;
      // Find and select the current location
      const currentLocation = locations.find(l => l.id === this.therapy.location.id);
      if (currentLocation) {
        this.therapy.location = currentLocation;
      }
    });
  }

  // Helper function to compare objects by ID in mat-select
  compareById(obj1: any, obj2: any): boolean {
    return obj1 && obj2 && obj1.id === obj2.id;
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    console.log('Saving therapy:', this.therapy);
    
    // Combine date and time
    const [startHours, startMinutes] = this.startTime.split(':').map(Number);
    const [endHours, endMinutes] = this.endTime.split(':').map(Number);

    const startDate = new Date(this.selectedDate);
    const endDate = new Date(this.selectedDate);

    startDate.setHours(startHours, startMinutes);
    endDate.setHours(endHours, endMinutes);

    this.therapy.startTime = startDate;
    this.therapy.endTime = endDate;

    console.log('Updated therapy:', this.therapy);
    this.dialogRef.close(this.therapy);
  }
}
