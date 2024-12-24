import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { Therapy } from '../../../models/therapy';
import { Employee } from '../../../models/employee';
import { Patient } from '../../../models/patient';
import { EmployeeService } from '../../../services/employee.service';
import { PatientService } from '../../../services/patient.service';

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
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class TherapyDialogComponent {
  therapy: Therapy;
  employees: Employee[] = [];
  patients: Patient[] = [];
  therapyTypes: string[] = ['Einzel', 'Gruppe', 'Workshop'];

  constructor(
    public dialogRef: MatDialogRef<TherapyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { therapy?: Therapy },
    private employeeService: EmployeeService,
    private patientService: PatientService
  ) {
    this.therapy = data.therapy ? { ...data.therapy } : {
      name: '',
      patients: [],
      leadingEmployee: {} as Employee,
      location: '',
      time: new Date(),
      preparationTime: 15,
      followUpTime: 15,
      therapyType: ''
    };

    this.loadEmployees();
    this.loadPatients();
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

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.isValid()) {
      this.dialogRef.close(this.therapy);
    }
  }

  private isValid(): boolean {
    return !!(
      this.therapy.name &&
      this.therapy.leadingEmployee &&
      this.therapy.patients.length > 0 &&
      this.therapy.location &&
      this.therapy.time &&
      this.therapy.therapyType
    );
  }

  compareEmployees(employee1: Employee, employee2: Employee): boolean {
    return employee1?.id === employee2?.id;
  }

  comparePatients(patient1: Patient, patient2: Patient): boolean {
    return patient1?.id === patient2?.id;
  }
}
