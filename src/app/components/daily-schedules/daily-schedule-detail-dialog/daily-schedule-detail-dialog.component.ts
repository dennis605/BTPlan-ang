import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Therapy } from '../../../models/therapy';

@Component({
  selector: 'app-daily-schedule-detail-dialog',
  templateUrl: './daily-schedule-detail-dialog.component.html',
  styleUrls: ['./daily-schedule-detail-dialog.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ]
})
export class DailyScheduleDetailDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<DailyScheduleDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public therapy: Therapy
  ) {}

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
