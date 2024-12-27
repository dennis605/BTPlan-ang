import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Patient } from '../../../models/patient';
import { PatientService } from '../../../services/patient.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, Sort, MatSort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { PatientDialogComponent } from '../patient-dialog/patient-dialog.component';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  styles: [`
    .container {
      padding: 20px;
    }
    .add-button {
      margin-bottom: 20px;
    }
    table {
      width: 100%;
    }
    .mat-column-actions {
      width: 100px;
      text-align: center;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule
  ]
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  displayedColumns: string[] = ['name', 'surname', 'note', 'actions'];
  
  @ViewChild(MatSort) sort!: MatSort;

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

  onSort(event: Sort) {
    if (!event.active || event.direction === '') {
      // Wenn keine Sortierung aktiv ist oder die Sortierung aufgehoben wurde
      this.loadPatients();
      return;
    }

    this.patientService.getPatients(event.active, event.direction as 'asc' | 'desc')
      .subscribe(patients => {
        this.patients = patients;
      });
  }

  deletePatient(id: number): void {
    if (confirm('Möchten Sie diesen Patienten wirklich löschen?')) {
      this.patientService.deletePatient(id).subscribe({
        next: () => {
          this.loadPatients();
        },
        error: (error) => {
          console.error('Fehler beim Löschen des Patienten:', error);
          alert('Fehler beim Löschen des Patienten');
        }
      });
    }
  }

  editPatient(patient: Patient): void {
    const dialogRef = this.dialog.open(PatientDialogComponent, {
      data: { patient: patient }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patientService.updatePatient(result).subscribe({
          next: () => {
            this.loadPatients();
          },
          error: (error) => {
            console.error('Fehler beim Aktualisieren des Patienten:', error);
            alert('Fehler beim Aktualisieren des Patienten');
          }
        });
      }
    });
  }

  addPatient(): void {
    const dialogRef = this.dialog.open(PatientDialogComponent, {
      data: { patient: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.patientService.addPatient(result).subscribe({
          next: () => {
            this.loadPatients();
          },
          error: (error) => {
            console.error('Fehler beim Hinzufügen des Patienten:', error);
            alert('Fehler beim Hinzufügen des Patienten');
          }
        });
      }
    });
  }
}
