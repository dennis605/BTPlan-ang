import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { Patient } from '../../../models/patient';
import { TherapyDetail } from '../../../models/therapy-detail';

interface DialogData {
  patient: Patient;
  therapyDetails: TherapyDetail[];
  startDate: Date;
  endDate: Date;
}

@Component({
  selector: 'app-statistics-detail-dialog',
  templateUrl: './statistics-detail-dialog.component.html',
  styleUrls: ['./statistics-detail-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatTableModule
  ]
})
export class StatisticsDetailDialogComponent {
  displayedColumns: string[] = ['date', 'name', 'startTime', 'endTime', 'duration'];

  constructor(
    public dialogRef: MatDialogRef<StatisticsDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: DialogData
  ) {}

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('de-DE');
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('de-DE', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  }

  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = Math.round(minutes % 60);
    return `${hours}:${remainingMinutes.toString().padStart(2, '0')} h`;
  }
}
