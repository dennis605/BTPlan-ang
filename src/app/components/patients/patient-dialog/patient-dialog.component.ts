import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Patient } from '../../../models/patient';

@Component({
  selector: 'app-patient-dialog',
  template: `
    <h2 mat-dialog-title>{{data.patient ? 'Patient bearbeiten' : 'Neuer Patient'}}</h2>
    <mat-dialog-content>
      <form #patientForm="ngForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput [(ngModel)]="patient.name" name="name" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Nachname</mat-label>
          <input matInput [(ngModel)]="patient.surname" name="surname" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Notiz</mat-label>
          <textarea matInput [(ngModel)]="patient.note" name="note" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Abbrechen</button>
      <button mat-raised-button color="primary" 
              (click)="onSave()" 
              [disabled]="!patientForm.form.valid">
        Speichern
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 15px;
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
    MatButtonModule
  ]
})
export class PatientDialogComponent {
  patient: Patient;

  constructor(
    public dialogRef: MatDialogRef<PatientDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { patient?: Patient }
  ) {
    this.patient = data.patient ? { ...data.patient } : {
      id: crypto.randomUUID(),
      name: '',
      surname: '',
      note: ''
    };
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.patient.name && this.patient.surname) {
      this.dialogRef.close(this.patient);
    }
  }
}
