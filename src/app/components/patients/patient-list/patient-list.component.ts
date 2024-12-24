import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Patient } from '../../../models/patient';
import { PatientService } from '../../../services/patient.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PatientDialogComponent } from '../patient-dialog/patient-dialog.component';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styleUrls: ['./patient-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule
  ]
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  displayedColumns: string[] = ['name', 'surname', 'note', 'actions'];

  constructor(
    private patientService: PatientService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe(patients => {
      this.patients = patients;
    });
  }

  deletePatient(id: number): void {
    if (confirm('Möchten Sie diesen Patienten wirklich löschen?')) {
      this.patientService.deletePatient(id);
    }
  }

  editPatient(patient: Patient): void {
    const dialogRef = this.dialog.open(PatientDialogComponent, {
      data: { patient: patient }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patientService.updatePatient(result);
      }
    });
  }

  addPatient(): void {
    const dialogRef = this.dialog.open(PatientDialogComponent, {
      data: { patient: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patientService.addPatient(result);
      }
    });
  }
}
