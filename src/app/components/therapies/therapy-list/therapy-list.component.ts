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
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-therapy-list',
  templateUrl: './therapy-list.component.html',
  styles: [`
    .container {
      padding: 20px;
    }
    .action-buttons {
      margin-bottom: 20px;
      display: flex;
      gap: 10px;
    }
    table {
      width: 100%;
    }
    .mat-column-select {
      width: 48px;
      padding-right: 8px;
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
    MatTooltipModule,
    MatCheckboxModule
  ]
})
export class TherapyListComponent implements OnInit {
  therapies: Therapy[] = [];
  displayedColumns: string[] = ['select', 'name', 'leadingEmployee', 'patients', 'location', 'time', 'preparationTime', 'followUpTime', 'comment', 'actions'];
  selection = new SelectionModel<Therapy>(true, []);
  
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
      this.selection.clear();
    });
  }

  /** Ob alle Zeilen ausgewählt sind */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.therapies.length;
    return numSelected === numRows;
  }

  /** Auswahl aller Zeilen umschalten */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.therapies.forEach(row => this.selection.select(row));
  }

  /** Text für die Checkbox in der Header-Zeile */
  checkboxLabel(row?: Therapy): string {
    if (!row) {
      return `${this.isAllSelected() ? 'Alle abwählen' : 'Alle auswählen'}`;
    }
    return `${this.selection.isSelected(row) ? 'Abwählen' : 'Auswählen'}`;
  }

  /** Ausgewählte Therapien löschen */
  deleteSelected() {
    if (this.selection.selected.length === 0) return;

    const message = this.selection.selected.length === 1
      ? 'Möchten Sie diese Therapie wirklich löschen?'
      : `Möchten Sie diese ${this.selection.selected.length} Therapien wirklich löschen?`;

    if (confirm(message)) {
      // Nur Therapien mit gültiger ID löschen
      const deleteObservables = this.selection.selected
        .filter(therapy => therapy.id !== undefined)
        .map(therapy => this.therapyService.deleteTherapy(therapy.id!));

      if (deleteObservables.length > 0) {
        forkJoin(deleteObservables).subscribe({
          next: () => {
            this.loadTherapies();
          },
          error: (error) => {
            console.error('Fehler beim Löschen der Therapien:', error);
            alert('Fehler beim Löschen der Therapien');
          }
        });
      }
    }
  }

  onSort(event: Sort) {
    if (!event.active || event.direction === '') {
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
