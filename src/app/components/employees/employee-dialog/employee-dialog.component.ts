import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Employee } from '../../../models/employee';

@Component({
  selector: 'app-employee-dialog',
  template: `
    <h2 mat-dialog-title>{{data.employee ? 'Mitarbeiter bearbeiten' : 'Neuer Mitarbeiter'}}</h2>
    <mat-dialog-content>
      <form #employeeForm="ngForm">
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Vorname</mat-label>
          <input matInput [(ngModel)]="employee.name" name="name" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Nachname</mat-label>
          <input matInput [(ngModel)]="employee.surname" name="surname" required>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Notiz</mat-label>
          <textarea matInput [(ngModel)]="employee.note" name="note" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Abbrechen</button>
      <button mat-raised-button color="primary" 
              (click)="onSave()" 
              [disabled]="!employeeForm.form.valid">
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
export class EmployeeDialogComponent {
  employee: Employee;

  constructor(
    public dialogRef: MatDialogRef<EmployeeDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { employee?: Employee }
  ) {
    this.employee = data.employee ? { ...data.employee } : {
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
    if (this.employee.name && this.employee.surname) {
      this.dialogRef.close(this.employee);
    }
  }
}
