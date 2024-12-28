import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Therapy } from '../../../models/therapy';
import { TherapyService } from '../../../services/therapy.service';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSortModule, Sort, MatSort } from '@angular/material/sort';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { TherapyDialogComponent } from '../therapy-dialog/therapy-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { forkJoin } from 'rxjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';

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
    .search-field {
      width: 100%;
      margin-bottom: 20px;
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
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatSortModule,
    MatDialogModule,
    MatChipsModule,
    MatTooltipModule,
    MatCheckboxModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule
  ]
})
export class TherapyListComponent implements OnInit, AfterViewInit {
  dataSource: MatTableDataSource<Therapy>;
  displayedColumns: string[] = ['select', 'name', 'leadingEmployee', 'patients', 'location', 'time', 'preparationTime', 'followUpTime', 'comment', 'actions'];
  selection = new SelectionModel<Therapy>(true, []);
  isLoading = false;
  therapies: Therapy[] = [];
  
  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private therapyService: TherapyService,
    private dialog: MatDialog
  ) {
    this.dataSource = new MatTableDataSource<Therapy>([]);
  }

  ngOnInit(): void {
    this.loadTherapies();
    this.dataSource.filterPredicate = (data: Therapy, filter: string) => {
      const searchStr = filter.toLowerCase();
      return data.name.toLowerCase().includes(searchStr) ||
             (data.leadingEmployee?.name?.toLowerCase()?.includes(searchStr) || false) ||
             (data.leadingEmployee?.surname?.toLowerCase()?.includes(searchStr) || false) ||
             (data.location?.name?.toLowerCase()?.includes(searchStr) || false) ||
             data.patients.some(p => 
               (p?.name?.toLowerCase()?.includes(searchStr) || false) || 
               (p?.surname?.toLowerCase()?.includes(searchStr) || false)
             ) ||
             (data.comment?.toLowerCase()?.includes(searchStr) || false);
    };
  }

  ngAfterViewInit() {
    this.dataSource.sort = this.sort;
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();

    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  loadTherapies(): void {
    this.isLoading = true;
    this.therapyService.getTherapies().subscribe({
      next: (therapies) => {
        this.therapies = therapies;
        this.dataSource.data = therapies;
      },
      error: (error) => {
        console.error('Fehler beim Laden der Therapien:', error);
        alert('Fehler beim Laden der Therapien');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  /** Ob alle Zeilen ausgewählt sind */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.dataSource.data.length;
    return numSelected === numRows;
  }

  /** Auswahl aller Zeilen umschalten */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.dataSource.data.forEach(row => this.selection.select(row));
  }

  /** Text für die Checkbox in der Header-Zeile */
  checkboxLabel(row?: Therapy): string {
    if (!row) {
      return `${this.isAllSelected() ? 'Alle abwählen' : 'Alle auswählen'}`;
    }
    return `${this.selection.isSelected(row) ? 'Abwählen' : 'Auswählen'}`;
  }

  deleteSelectedTherapies(): void {
    const selectedTherapies = this.selection.selected;
    if (selectedTherapies.length === 0) {
      alert('Bitte wählen Sie mindestens eine Therapie aus.');
      return;
    }

    if (confirm(`Möchten Sie ${selectedTherapies.length} Therapie(n) wirklich löschen?`)) {
      const deleteRequests = selectedTherapies.map(therapy =>
        this.therapyService.deleteTherapyById(therapy.id!)
      );

      forkJoin(deleteRequests).subscribe({
        next: () => {
          this.selection.clear();
          this.loadTherapies();
        },
        error: (error) => {
          console.error('Fehler beim Löschen der Therapien:', error);
          alert('Fehler beim Löschen der Therapien');
        }
      });
    }
  }

  onSort(event: Sort) {
    const data = this.dataSource.data.slice();
    if (!event.active || event.direction === '') {
      this.dataSource.data = data;
      return;
    }

    this.dataSource.data = data.sort((a, b) => {
      const isAsc = event.direction === 'asc';
      switch (event.active) {
        case 'name':
          return this.compare(a.name, b.name, isAsc);
        case 'leadingEmployee':
          return this.compare(a.leadingEmployee?.name, b.leadingEmployee?.name, isAsc);
        case 'location':
          return this.compare(a.location?.name, b.location?.name, isAsc);
        case 'startTime':
          return this.compare(
            a.startTime ? new Date(a.startTime).getTime() : undefined,
            b.startTime ? new Date(b.startTime).getTime() : undefined,
            isAsc
          );
        case 'endTime':
          return this.compare(
            a.endTime ? new Date(a.endTime).getTime() : undefined,
            b.endTime ? new Date(b.endTime).getTime() : undefined,
            isAsc
          );
        case 'preparationTime':
          return this.compare(a.preparationTime, b.preparationTime, isAsc);
        case 'followUpTime':
          return this.compare(a.followUpTime, b.followUpTime, isAsc);
        default:
          return 0;
      }
    });
  }

  private compare(a: number | string | undefined, b: number | string | undefined, isAsc: boolean): number {
    // Wenn beide undefined sind, sind sie gleich
    if (a === undefined && b === undefined) return 0;
    // undefined-Werte kommen ans Ende
    if (a === undefined) return 1;
    if (b === undefined) return -1;
    // Normale Sortierung für definierte Werte
    return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('de-DE');
  }

  formatTime(date: string): string {
    return new Date(date).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  deleteTherapy(therapy: Therapy): void {
    if (confirm(`Möchten Sie die Therapie "${therapy.name}" wirklich löschen?`)) {
      this.therapyService.deleteTherapyById(therapy.id!).subscribe({
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

  editTherapy(therapy: Therapy): void {
    const dialogRef = this.dialog.open(TherapyDialogComponent, {
      width: '600px',
      data: { therapy: { ...therapy } }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.therapyService.updateTherapyById(result).subscribe({
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

  duplicateTherapy(therapy: Therapy): void {
    const newTherapy = {
      ...therapy,
      id: undefined,
      name: `${therapy.name} (Kopie)`
    };

    this.therapyService.createTherapy(newTherapy).subscribe({
      next: () => {
        this.loadTherapies();
      },
      error: (error) => {
        console.error('Fehler beim Duplizieren der Therapie:', error);
        alert('Fehler beim Duplizieren der Therapie');
      }
    });
  }

  addTherapy(): void {
    const dialogRef = this.dialog.open(TherapyDialogComponent, {
      width: '600px',
      data: { therapy: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.therapyService.createTherapy(result).subscribe({
          next: () => {
            this.loadTherapies();
          },
          error: (error) => {
            console.error('Fehler beim Erstellen der Therapie:', error);
            alert('Fehler beim Erstellen der Therapie');
          }
        });
      }
    });
  }
}
