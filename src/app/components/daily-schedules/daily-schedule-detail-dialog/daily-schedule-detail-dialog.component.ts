import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { Therapy } from '../../../models/therapy';
import moment from 'moment';

@Component({
  selector: 'app-daily-schedule-detail-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './daily-schedule-detail-dialog.component.html',
  styleUrls: ['./daily-schedule-detail-dialog.component.scss']
})
export class DailyScheduleDetailDialogComponent {
  therapy: Therapy;

  constructor(
    public dialogRef: MatDialogRef<DailyScheduleDetailDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { therapy: Therapy }
  ) {
    this.therapy = data.therapy;
  }

  formatTime(time: string | Date): string {
    return moment(time).format('HH:mm');
  }

  onClose(): void {
    this.dialogRef.close();
  }
}
