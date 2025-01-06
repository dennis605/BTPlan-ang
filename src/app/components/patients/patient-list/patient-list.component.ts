import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Patient } from '../../../models/patient';
import { PatientService } from '../../../services/patient.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { PatientDialogComponent } from '../patient-dialog/patient-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTooltipModule } from '@angular/material/tooltip';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-patient-list',
  template: `
    <div class="container">
      <div class="action-buttons">
        <button mat-raised-button color="primary" (click)="addPatient()">
          <mat-icon>add</mat-icon>
          Bewohner hinzufügen
        </button>
        <button mat-raised-button color="warn" 
                [disabled]="selection.isEmpty()"
                (click)="deleteSelected()"
                matTooltip="Ausgewählte Patienten löschen">
          <mat-icon>delete</mat-icon>
          Löschen
        </button>
      </div>

      <table mat-table [dataSource]="patients" class="mat-elevation-z8">
        <!-- Checkbox Column -->
        <ng-container matColumnDef="select">
          <th mat-header-cell *matHeaderCellDef>
            <mat-checkbox (change)="$event ? masterToggle() : null"
                        [checked]="selection.hasValue() && isAllSelected()"
                        [indeterminate]="selection.hasValue() && !isAllSelected()"
                        [aria-label]="checkboxLabel()">
            </mat-checkbox>
          </th>
          <td mat-cell *matCellDef="let row">
            <mat-checkbox (click)="$event.stopPropagation()"
                        (change)="$event ? selection.toggle(row) : null"
                        [checked]="selection.isSelected(row)"
                        [aria-label]="checkboxLabel(row)">
            </mat-checkbox>
          </td>
        </ng-container>

        <!-- Name Column -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let patient">{{patient.name}}</td>
        </ng-container>

        <!-- Surname Column -->
        <ng-container matColumnDef="surname">
          <th mat-header-cell *matHeaderCellDef>Nachname</th>
          <td mat-cell *matCellDef="let patient">{{patient.surname}}</td>
        </ng-container>

        <!-- Note Column -->
        <ng-container matColumnDef="note">
          <th mat-header-cell *matHeaderCellDef>Notiz</th>
          <td mat-cell *matCellDef="let patient">{{patient.note}}</td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Aktionen</th>
          <td mat-cell *matCellDef="let patient">
            <button mat-icon-button color="primary" (click)="editPatient(patient)"
                    matTooltip="Patient bearbeiten">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deletePatient(patient.id)"
                    matTooltip="Patient löschen">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
    </div>
  `,
  styles: [`
    .container {
      padding: 20px;
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
    MatDialogModule,
    MatCheckboxModule,
    MatTooltipModule
  ]
})
export class PatientListComponent implements OnInit {
  patients: Patient[] = [];
  displayedColumns: string[] = ['select', 'name', 'surname', 'note', 'actions'];
  selection = new SelectionModel<Patient>(true, []);

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
      const deleteObservables = this.selection.selected
        .map(patient => this.patientService.deletePatient(patient.id));

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

  deletePatient(id: string): void {
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
            console.error('Fehler beim Hinzufügen des Bewohners:', error);
            alert('Fehler beim Hinzufügen des Bewohners');
          }
        });
      }
    });
  }
}
