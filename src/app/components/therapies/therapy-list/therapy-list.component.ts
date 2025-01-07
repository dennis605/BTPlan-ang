import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Therapy } from '../../../models/therapy';
import { DailySchedule } from '../../../models/daily-schedule';
import { TherapyService } from '../../../services/therapy.service';
import { DailyScheduleService } from '../../../services/daily-schedule.service';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatPaginatorModule, MatPaginator } from '@angular/material/paginator';
import { CommonModule } from '@angular/common';
import { TherapyDialogComponent } from '../therapy-dialog/therapy-dialog.component';
import { MatDialogModule } from '@angular/material/dialog';
import { MatChipsModule } from '@angular/material/chips';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { SelectionModel } from '@angular/cdk/collections';
import { forkJoin, of } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FormsModule } from '@angular/forms';
import dayjs from 'dayjs';

@Component({
  selector: 'app-therapy-list',
  template: `
    <div class="container">
      <div class="action-buttons">
        <button mat-raised-button color="primary" (click)="addTherapy()">
          <mat-icon>add</mat-icon>
          Programm hinzufügen
        </button>
        <button mat-raised-button color="warn" 
                [disabled]="selection.isEmpty()"
                (click)="deleteSelected()"
                matTooltip="Ausgewählte Programme löschen">
          <mat-icon>delete</mat-icon>
          Löschen
        </button>
      </div>

      <mat-form-field class="search-field">
        <mat-label>Suchen</mat-label>
        <input matInput (keyup)="applyFilter($event)" placeholder="z.B. Name, Mitarbeiter, Ort..." #input>
      </mat-form-field>

      <table mat-table [dataSource]="dataSource" class="mat-elevation-z8">
        <!-- Checkbox Column -->
        <ng-container matColumnDef="select">
          <th mat-header-cell *matHeaderCellDef>
            <mat-checkbox (change)="$event ? masterToggle() : null"
                        [checked]="selection.hasValue() && isAllSelected()"
                        [indeterminate]="selection.hasValue() && !isAllSelected()"
                        [aria-label]="checkboxLabel()">
            </mat-checkbox>
          </th>
          <td mat-cell *matCellDef="let row">
            <mat-checkbox (click)="$event.stopPropagation()"
                        (change)="$event ? selection.toggle(row) : null"
                        [checked]="selection.isSelected(row)"
                        [aria-label]="checkboxLabel(row)">
            </mat-checkbox>
          </td>
        </ng-container>

        <!-- Name Column -->
        <ng-container matColumnDef="name">
          <th mat-header-cell *matHeaderCellDef>Programmname</th>
          <td mat-cell *matCellDef="let therapy">{{therapy.name}}</td>
        </ng-container>

        <!-- Leading Employee Column -->
        <ng-container matColumnDef="leadingEmployee">
          <th mat-header-cell *matHeaderCellDef>Mitarbeiter</th>
          <td mat-cell *matCellDef="let therapy">
            {{therapy.leadingEmployee?.name}} {{therapy.leadingEmployee?.surname}}
          </td>
        </ng-container>

        <!-- Patients Column -->
        <ng-container matColumnDef="patients">
          <th mat-header-cell *matHeaderCellDef>Bewohner</th>
          <td mat-cell *matCellDef="let therapy">
            <mat-chip-set>
              <mat-chip *ngFor="let patient of therapy.patients">
                {{patient.name}} {{patient.surname}}
              </mat-chip>
            </mat-chip-set>
          </td>
        </ng-container>

        <!-- Location Column -->
        <ng-container matColumnDef="location">
          <th mat-header-cell *matHeaderCellDef>Ort</th>
          <td mat-cell *matCellDef="let therapy">{{therapy.location?.name}}</td>
        </ng-container>

        <!-- Time Column -->
        <ng-container matColumnDef="time">
          <th mat-header-cell *matHeaderCellDef>Zeit</th>
          <td mat-cell *matCellDef="let therapy">
            {{formatDate(therapy.startTime)}}<br>
            {{formatTime(therapy.startTime)}} - {{formatTime(therapy.endTime)}}
          </td>
        </ng-container>

        <!-- Preparation Time Column -->
        <ng-container matColumnDef="preparationTime">
          <th mat-header-cell *matHeaderCellDef>Vorbereitung</th>
          <td mat-cell *matCellDef="let therapy">{{therapy.preparationTime}} Min.</td>
        </ng-container>

        <!-- Follow Up Time Column -->
        <ng-container matColumnDef="followUpTime">
          <th mat-header-cell *matHeaderCellDef>Nachbereitung</th>
          <td mat-cell *matCellDef="let therapy">{{therapy.followUpTime}} Min.</td>
        </ng-container>

        <!-- Comment Column -->
        <ng-container matColumnDef="comment">
          <th mat-header-cell *matHeaderCellDef>Kommentar</th>
          <td mat-cell *matCellDef="let therapy">{{therapy.comment}}</td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Aktionen</th>
          <td mat-cell *matCellDef="let therapy">
            <button mat-icon-button color="primary" (click)="editTherapy(therapy)"
                    matTooltip="Programm bearbeiten">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="accent" (click)="duplicateTherapy(therapy)"
                    matTooltip="Programm duplizieren">
              <mat-icon>content_copy</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteTherapy(therapy.id)"
                    matTooltip="Programm löschen">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>

      <mat-paginator [pageSizeOptions]="[10, 25, 50]"
                    showFirstLastButtons
                    aria-label="Seite wählen">
      </mat-paginator>
    </div>
  `,
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
  
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private therapyService: TherapyService,
    private dailyScheduleService: DailyScheduleService,
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
    this.therapyService.getTherapies().subscribe(therapies => {
      // Sortiere die Therapien nach Erstellungsdatum absteigend
      this.dataSource.data = therapies.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      this.selection.clear();
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

  /** Ausgewählte Therapien löschen */
  deleteSelected() {
    if (this.selection.selected.length === 0) return;

    const message = this.selection.selected.length === 1
      ? 'Möchten Sie dieses Programm wirklich löschen?'
      : `Möchten Sie diese ${this.selection.selected.length} Programme wirklich löschen?`;

    if (confirm(message)) {
      // Für jede ausgewählte Therapie
      const deleteOperations = this.selection.selected.map(therapy => {
        const therapyDate = new Date(therapy.startTime);
        // Lösche die Therapie und aktualisiere den Tagesplan
        return this.therapyService.deleteTherapy(therapy.id).pipe(
          switchMap(() => this.dailyScheduleService.getScheduleByDate(therapyDate)),
          switchMap((schedule: DailySchedule | undefined) => {
            if (schedule) {
              // Entferne die Therapie aus dem Tagesplan
              const updatedSchedule = {
                ...schedule,
                therapies: schedule.therapies.filter((t: Therapy) => t.id !== therapy.id)
              };
              return this.dailyScheduleService.updateDailySchedule(updatedSchedule);
            }
            return of(null);
          })
        );
      });

      if (deleteOperations.length > 0) {
        forkJoin(deleteOperations).subscribe({
          next: () => {
            this.loadTherapies();
          },
          error: (error) => {
            console.error('Fehler beim Löschen der Programme:', error);
            alert('Fehler beim Löschen der Programme');
          }
        });
      }
    }
  }

  formatDate(date: string): string {
    return dayjs(date).format('DD.MM.YYYY');
  }

  formatTime(date: string): string {
    return dayjs(date).format('HH:mm');
  }

  deleteTherapy(id: string): void {
    if (confirm('Möchten Sie dieses Programm wirklich löschen?')) {
      // Finde zuerst die Therapie, um das Datum zu bekommen
      this.therapyService.getTherapy(id).subscribe({
        next: (therapy) => {
          if (therapy) {
            const therapyDate = new Date(therapy.startTime);
            // Lösche die Therapie
            this.therapyService.deleteTherapy(id).subscribe({
              next: () => {
                // Aktualisiere den Tagesplan
                this.dailyScheduleService.getScheduleByDate(therapyDate).subscribe({
                  next: (schedule: DailySchedule | undefined) => {
                    if (schedule) {
                      // Entferne die Therapie aus dem Tagesplan
                      const updatedSchedule = {
                        ...schedule,
                        therapies: schedule.therapies.filter(t => t.id !== id)
                      };
                      this.dailyScheduleService.updateDailySchedule(updatedSchedule).subscribe();
                    }
                  }
                });
                this.loadTherapies();
              },
              error: (error) => {
                console.error('Fehler beim Löschen des Programms:', error);
                alert('Fehler beim Löschen des Programms');
              }
            });
          }
        }
      });
    }
  }

  duplicateTherapy(therapy: Therapy): void {
    // Erstelle eine exakte Kopie mit neuem Namen und ID
    const duplicatedTherapy: Therapy = {
      id: crypto.randomUUID(),
      name: `${therapy.name}_copy`,
      patients: therapy.patients,
      leadingEmployee: therapy.leadingEmployee,
      location: therapy.location,
      startTime: therapy.startTime,
      endTime: therapy.endTime,
      preparationTime: therapy.preparationTime,
      followUpTime: therapy.followUpTime,
      comment: therapy.comment
    };

    const dialogRef = this.dialog.open(TherapyDialogComponent, {
      data: { therapy: duplicatedTherapy }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.therapyService.addTherapy(result).subscribe({
          next: (savedTherapy) => {
            // Erstelle oder aktualisiere den Tagesplan für das Datum der Therapie
            const therapyDate = new Date(savedTherapy.startTime);
            this.dailyScheduleService.getScheduleByDate(therapyDate).subscribe({
              next: (schedule: DailySchedule | undefined) => {
                if (schedule) {
                  // Füge die neue Therapie zum bestehenden Tagesplan hinzu
                  const updatedSchedule = {
                    ...schedule,
                    therapies: [...schedule.therapies, savedTherapy]
                  };
                  this.dailyScheduleService.updateDailySchedule(updatedSchedule).subscribe();
                } else {
                  // Erstelle einen neuen Tagesplan mit der Therapie
                  const newSchedule = {
                    id: crypto.randomUUID(),
                    date: therapyDate.toISOString(),
                    therapies: [savedTherapy]
                  };
                  this.dailyScheduleService.addDailySchedule(newSchedule).subscribe();
                }
              }
            });
            this.loadTherapies();
          },
          error: (error) => {
            console.error('Fehler beim Duplizieren des Programms:', error);
            alert('Fehler beim Duplizieren des Programms');
          }
        });
      }
    });
  }

  editTherapy(therapy: Therapy): void {
    const dialogRef = this.dialog.open(TherapyDialogComponent, {
      data: { therapy: therapy }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.therapyService.updateTherapy(result).subscribe({
          next: (savedTherapy) => {
            // Aktualisiere den Tagesplan für das Datum der Therapie
            const therapyDate = new Date(savedTherapy.startTime);
            this.dailyScheduleService.getScheduleByDate(therapyDate).subscribe({
              next: (schedule: DailySchedule | undefined) => {
                if (schedule) {
                  // Aktualisiere die Therapie im Tagesplan
                  const updatedSchedule = {
                    ...schedule,
                    therapies: schedule.therapies.map(t => 
                      t.id === savedTherapy.id ? savedTherapy : t
                    )
                  };
                  this.dailyScheduleService.updateDailySchedule(updatedSchedule).subscribe();
                }
              }
            });
            this.loadTherapies();
          },
          error: (error) => {
            console.error('Fehler beim Aktualisieren des Programms:', error);
            alert('Fehler beim Aktualisieren der Programms');
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
          next: (savedTherapy) => {
            // Erstelle oder aktualisiere den Tagesplan für das Datum der Therapie
            const therapyDate = new Date(savedTherapy.startTime);
            this.dailyScheduleService.getScheduleByDate(therapyDate).subscribe({
              next: (schedule: DailySchedule | undefined) => {
                if (schedule) {
                  // Füge die neue Therapie zum bestehenden Tagesplan hinzu
                  const updatedSchedule = {
                    ...schedule,
                    therapies: [...schedule.therapies, savedTherapy]
                  };
                  this.dailyScheduleService.updateDailySchedule(updatedSchedule).subscribe();
                } else {
                  // Erstelle einen neuen Tagesplan mit der Therapie
                  const newSchedule = {
                    id: crypto.randomUUID(),
                    date: therapyDate.toISOString(),
                    therapies: [savedTherapy]
                  };
                  this.dailyScheduleService.addDailySchedule(newSchedule).subscribe();
                }
              }
            });
            this.loadTherapies();
          },
          error: (error) => {
            console.error('Fehler beim Hinzufügen des Programms:', error);
            alert('Fehler beim Hinzufügen des Programms');
          }
        });
      }
    });
  }
}
