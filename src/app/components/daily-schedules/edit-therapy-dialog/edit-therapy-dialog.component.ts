import { Component, Inject } from '@angular/core';
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
          <mat-label>Ort</mat-label>
          <input matInput [(ngModel)]="therapy.location.name" name="location" required>
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
    MatChipsModule
  ]
})
export class EditTherapyDialogComponent {
  therapy: Therapy;
  startTime: string;
  endTime: string;

  constructor(
    private dialogRef: MatDialogRef<EditTherapyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { therapy: Therapy }
  ) {
    this.therapy = { ...data.therapy };
    this.startTime = new Date(this.therapy.startTime).toTimeString().slice(0, 5);
    this.endTime = new Date(this.therapy.endTime).toTimeString().slice(0, 5);
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    // Behalte das ursprüngliche Datum bei und aktualisiere nur die Uhrzeit
    const originalStartDate = new Date(this.therapy.startTime);
    const originalEndDate = new Date(this.therapy.endTime);

    const [startHours, startMinutes] = this.startTime.split(':').map(Number);
    const [endHours, endMinutes] = this.endTime.split(':').map(Number);

    originalStartDate.setHours(startHours, startMinutes);
    originalEndDate.setHours(endHours, endMinutes);

    this.therapy.startTime = originalStartDate;
    this.therapy.endTime = originalEndDate;

    this.dialogRef.close(this.therapy);
  }
}
