import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule, MAT_DATE_LOCALE } from '@angular/material/core';
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
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' }
  ]
})
export class TherapyDialogComponent {
  therapy: Therapy;
  employees: Employee[] = [];
  patients: Patient[] = [];
  therapyTypes: string[] = ['Einzel', 'Gruppe', 'Workshop'];
  selectedTime: string = '00:00';

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

    // Initialisiere selectedTime aus therapy.time
    if (data.therapy) {
      const time = new Date(this.therapy.time);
      this.selectedTime = `${time.getHours().toString().padStart(2, '0')}:${time.getMinutes().toString().padStart(2, '0')}`;
    }

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
      // Kombiniere Datum und Zeit
      const [hours, minutes] = this.selectedTime.split(':').map(Number);
      const combinedDateTime = new Date(this.therapy.time);
      combinedDateTime.setHours(hours, minutes);
      this.therapy.time = combinedDateTime;
      
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
