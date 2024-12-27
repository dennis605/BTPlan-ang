import { Component, OnInit, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Therapy } from '../../../models/therapy';
import { TherapyService } from '../../../services/therapy.service';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, Sort, MatSort } from '@angular/material/sort';
import { CommonModule } from '@angular/common';
import { TherapyDialogComponent } from '../therapy-dialog/therapy-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';

@Component({
  selector: 'app-therapy-list',
  templateUrl: './therapy-list.component.html',
  styles: [`
    .container {
      padding: 20px;
    }
    .add-button {
      margin-bottom: 20px;
    }
    table {
      width: 100%;
    }
    .mat-column-actions {
      width: 100px;
      text-align: center;
    }
    .mat-chip-set {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule
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
    'comment',
    'actions'
  ];
  
  @ViewChild(MatSort) sort!: MatSort;

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

  onSort(event: Sort) {
    if (!event.active || event.direction === '') {
      // Wenn keine Sortierung aktiv ist oder die Sortierung aufgehoben wurde
      this.loadTherapies();
      return;
    }

    this.therapyService.getTherapies(event.active, event.direction as 'asc' | 'desc')
      .subscribe(therapies => {
        this.therapies = therapies;
      });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('de-DE');
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  deleteTherapy(id: number): void {
    if (confirm('Möchten Sie diese Therapie wirklich löschen?')) {
      this.therapyService.deleteTherapy(id).subscribe({
        next: () => {
          this.loadTherapies();
        },
        error: (error) => {
          console.error('Fehler beim Löschen der Therapie:', error);
          alert('Fehler beim Löschen der Therapie');
        }
      });
    }
  }

  duplicateTherapy(therapy: Therapy): void {
    if (confirm('Möchten Sie diese Therapie duplizieren?')) {
      this.therapyService.duplicateTherapy(therapy).subscribe({
        next: () => {
          this.loadTherapies();
        },
        error: (error) => {
          console.error('Fehler beim Duplizieren der Therapie:', error);
          alert('Fehler beim Duplizieren der Therapie');
        }
      });
    }
  }

  editTherapy(therapy: Therapy): void {
    const dialogRef = this.dialog.open(TherapyDialogComponent, {
      data: { therapy: therapy }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.therapyService.updateTherapy(result).subscribe({
          next: () => {
            this.loadTherapies();
          },
          error: (error) => {
            console.error('Fehler beim Aktualisieren der Therapie:', error);
            alert('Fehler beim Aktualisieren der Therapie');
          }
        });
      }
    });
  }

  addTherapy(): void {
    const dialogRef = this.dialog.open(TherapyDialogComponent, {
      data: { therapy: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.therapyService.addTherapy(result).subscribe({
          next: () => {
            this.loadTherapies();
          },
          error: (error) => {
            console.error('Fehler beim Hinzufügen der Therapie:', error);
            alert('Fehler beim Hinzufügen der Therapie');
          }
        });
      }
    });
  }
}
