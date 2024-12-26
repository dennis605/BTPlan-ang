import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS, MatNativeDateModule } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { Therapy } from '../../../models/therapy';
import moment from 'moment';

@Component({
  selector: 'app-duplicate-therapy-dialog',
  template: `
    <h2 mat-dialog-title>Therapie duplizieren</h2>
    <mat-dialog-content>
      <p>Bitte wählen Sie das Datum aus, zu dem die Therapie "{{therapy.name}}" kopiert werden soll:</p>
      <mat-form-field appearance="fill" class="full-width">
        <mat-label>Zieldatum</mat-label>
        <input matInput [matDatepicker]="picker" [(ngModel)]="targetDate" required>
        <mat-datepicker-toggle matIconSuffix [for]="picker"></mat-datepicker-toggle>
        <mat-datepicker #picker></mat-datepicker>
      </mat-form-field>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button (click)="onCancel()">Abbrechen</button>
      <button mat-raised-button color="primary" 
              (click)="onConfirm()"
              [disabled]="!targetDate">
        Duplizieren
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule,
    FormsModule
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
          dateInput: 'L',
        },
        display: {
          dateInput: 'L',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    }
  ]
})
export class DuplicateTherapyDialogComponent {
  targetDate: Date;
  therapy: Therapy;

  constructor(
    private dialogRef: MatDialogRef<DuplicateTherapyDialogComponent>,
    @Inject(MAT_DIALOG_DATA) data: { therapy: Therapy }
  ) {
    this.therapy = data.therapy;
    // Set default date to tomorrow
    this.targetDate = new Date();
    this.targetDate.setDate(this.targetDate.getDate() + 1);
    
    // Initialize moment locale
    moment.locale('de');
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onConfirm(): void {
    if (this.targetDate) {
      this.dialogRef.close(this.targetDate);
    }
  }
}
