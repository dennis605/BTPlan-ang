import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';

@Component({
  selector: 'app-duplicate-schedule-dialog',
  template: `
    <h2 mat-dialog-title>Tagesplan duplizieren</h2>
    <mat-dialog-content>
      <p>Bitte wählen Sie das Datum für den duplizierten Tagesplan:</p>
      <mat-form-field appearance="fill">
        <mat-label>Neues Datum</mat-label>
        <input matInput [matDatepicker]="picker" [(ngModel)]="selectedDate" required>
        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Abbrechen</button>
      <button mat-raised-button color="primary" (click)="onConfirm()" [disabled]="!selectedDate">
        Duplizieren
      </button>
    </mat-dialog-actions>
  `,
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatDialogModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'DD.MM.YYYY',
        },
        display: {
          dateInput: 'DD.MM.YYYY',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    }
  ]
})
export class DuplicateScheduleDialogComponent {
  selectedDate: Date = new Date();

  constructor(
    private dialogRef: MatDialogRef<DuplicateScheduleDialogComponent>
  ) {}

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    this.dialogRef.close(this.selectedDate);
  }
}
