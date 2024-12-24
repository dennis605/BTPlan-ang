import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Therapy } from '../../../models/therapy';
import { TherapyService } from '../../../services/therapy.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { MatChipsModule } from '@angular/material/chips';
import { TherapyDialogComponent } from '../therapy-dialog/therapy-dialog.component';

@Component({
  selector: 'app-therapy-list',
  templateUrl: './therapy-list.component.html',
  styleUrls: ['./therapy-list.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ]
})
export class TherapyListComponent implements OnInit {
  therapies: Therapy[] = [];
  displayedColumns: string[] = [
    'name',
    'leadingEmployee',
    'patients',
    'location',
    'time',
    'preparationTime',
    'followUpTime',
    'therapyType',
    'actions'
  ];

  constructor(
    private therapyService: TherapyService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadTherapies();
  }

  loadTherapies(): void {
    this.therapyService.getTherapies().subscribe(therapies => {
      this.therapies = therapies;
    });
  }

  deleteTherapy(id: number): void {
    if (confirm('Möchten Sie diese Therapie wirklich löschen?')) {
      this.therapyService.deleteTherapy(id);
    }
  }

  editTherapy(therapy: Therapy): void {
    const dialogRef = this.dialog.open(TherapyDialogComponent, {
      data: { therapy: therapy }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.therapyService.updateTherapy(result);
      }
    });
  }

  addTherapy(): void {
    const dialogRef = this.dialog.open(TherapyDialogComponent, {
      data: { therapy: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.therapyService.addTherapy(result);
      }
    });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'short',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }
}
