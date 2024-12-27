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
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';

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
    .action-buttons {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }
    table {
      width: 100%;
    }
    .mat-column-select {
      width: 48px;
      padding-right: 8px;
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
    MatSortModule,
    MatDialogModule,
    MatCheckboxModule,
    MatTooltipModule
  ]
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  displayedColumns: string[] = ['select', 'name', 'surname', 'note', 'actions'];
  selection = new SelectionModel<Patient>(true, []);
  
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
      this.selection.clear();
    });
  }

  /** Ob alle Zeilen ausgewählt sind */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.patients.length;
    return numSelected === numRows;
  }

  /** Auswahl aller Zeilen umschalten */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.patients.forEach(row => this.selection.select(row));
  }

  /** Text für die Checkbox in der Header-Zeile */
  checkboxLabel(row?: Patient): string {
    if (!row) {
      return `${this.isAllSelected() ? 'Alle abwählen' : 'Alle auswählen'}`;
    }
    return `${this.selection.isSelected(row) ? 'Abwählen' : 'Auswählen'}`;
  }

  /** Ausgewählte Patienten löschen */
  deleteSelected() {
    if (this.selection.selected.length === 0) return;

    const message = this.selection.selected.length === 1
      ? 'Möchten Sie diesen Patienten wirklich löschen?'
      : `Möchten Sie diese ${this.selection.selected.length} Patienten wirklich löschen?`;

    if (confirm(message)) {
      // Nur Patienten mit gültiger ID löschen
      const deleteObservables = this.selection.selected
        .filter(patient => patient.id !== undefined)
        .map(patient => this.patientService.deletePatient(patient.id!));

      if (deleteObservables.length > 0) {
        forkJoin(deleteObservables).subscribe({
          next: () => {
            this.loadPatients();
          },
          error: (error) => {
            console.error('Fehler beim Löschen der Patienten:', error);
            alert('Fehler beim Löschen der Patienten');
          }
        });
      }
    }
  }

  onSort(event: Sort) {
    if (!event.active || event.direction === '') {
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
