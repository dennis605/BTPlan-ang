import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '../../../models/location';
import { LocationService } from '../../../services/location.service';
import { LocationDialogComponent } from '../location-dialog/location-dialog.component';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatTooltipModule } from '@angular/material/tooltip';
import { SelectionModel } from '@angular/cdk/collections';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-location-list',
  template: `
    <div class="container">
      <div class="action-buttons">
        <button mat-raised-button color="primary" (click)="addLocation()">
          <mat-icon>add</mat-icon>
          Ort hinzufügen
        </button>
        <button mat-raised-button color="warn" 
                [disabled]="selection.isEmpty()"
                (click)="deleteSelected()"
                matTooltip="Ausgewählte Orte löschen">
          <mat-icon>delete</mat-icon>
          Löschen
        </button>
      </div>

      <table mat-table [dataSource]="locations" class="mat-elevation-z8">
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
          <th mat-header-cell *matHeaderCellDef>Name</th>
          <td mat-cell *matCellDef="let location">{{location.name}}</td>
        </ng-container>

        <!-- Description Column -->
        <ng-container matColumnDef="description">
          <th mat-header-cell *matHeaderCellDef>Beschreibung</th>
          <td mat-cell *matCellDef="let location">{{location.description}}</td>
        </ng-container>

        <!-- Actions Column -->
        <ng-container matColumnDef="actions">
          <th mat-header-cell *matHeaderCellDef>Aktionen</th>
          <td mat-cell *matCellDef="let location">
            <button mat-icon-button color="primary" (click)="editLocation(location)"
                    matTooltip="Ort bearbeiten">
              <mat-icon>edit</mat-icon>
            </button>
            <button mat-icon-button color="warn" (click)="deleteLocation(location.id)"
                    matTooltip="Ort löschen">
              <mat-icon>delete</mat-icon>
            </button>
          </td>
        </ng-container>

        <tr mat-header-row *matHeaderRowDef="displayedColumns"></tr>
        <tr mat-row *matRowDef="let row; columns: displayedColumns;"></tr>
      </table>
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
  `],
  standalone: true,
  imports: [
    CommonModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    MatCheckboxModule,
    MatTooltipModule
  ]
})
export class LocationListComponent implements OnInit {
  locations: Location[] = [];
  displayedColumns: string[] = ['select', 'name', 'description', 'actions'];
  selection = new SelectionModel<Location>(true, []);

  constructor(
    private locationService: LocationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.locationService.getLocations().subscribe(locations => {
      this.locations = locations;
      this.selection.clear();
    });
  }

  /** Ob alle Zeilen ausgewählt sind */
  isAllSelected() {
    const numSelected = this.selection.selected.length;
    const numRows = this.locations.length;
    return numSelected === numRows;
  }

  /** Auswahl aller Zeilen umschalten */
  masterToggle() {
    this.isAllSelected() ?
      this.selection.clear() :
      this.locations.forEach(row => this.selection.select(row));
  }

  /** Text für die Checkbox in der Header-Zeile */
  checkboxLabel(row?: Location): string {
    if (!row) {
      return `${this.isAllSelected() ? 'Alle abwählen' : 'Alle auswählen'}`;
    }
    return `${this.selection.isSelected(row) ? 'Abwählen' : 'Auswählen'}`;
  }

  /** Ausgewählte Orte löschen */
  deleteSelected() {
    if (this.selection.selected.length === 0) return;

    const message = this.selection.selected.length === 1
      ? 'Möchten Sie diesen Ort wirklich löschen?'
      : `Möchten Sie diese ${this.selection.selected.length} Orte wirklich löschen?`;

    if (confirm(message)) {
      const deleteObservables = this.selection.selected
        .map(location => this.locationService.deleteLocation(location.id));

      if (deleteObservables.length > 0) {
        forkJoin(deleteObservables).subscribe({
          next: () => {
            this.loadLocations();
          },
          error: (error) => {
            console.error('Fehler beim Löschen der Orte:', error);
            alert('Fehler beim Löschen der Orte');
          }
        });
      }
    }
  }

  deleteLocation(id: string): void {
    if (!id || id.trim() === '') {
      console.error('Keine gültige ID zum Löschen vorhanden');
      return;
    }

    if (confirm('Möchten Sie diesen Ort wirklich löschen?')) {
      this.locationService.deleteLocation(id).subscribe({
        next: () => {
          this.loadLocations();
        },
        error: (error) => {
          console.error('Fehler beim Löschen des Ortes:', error);
          alert('Fehler beim Löschen des Ortes');
        }
      });
    }
  }

  editLocation(location: Location): void {
    const dialogRef = this.dialog.open(LocationDialogComponent, {
      width: '400px',
      data: { location }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.locationService.updateLocation(result).subscribe({
          next: () => {
            this.loadLocations();
          },
          error: (error) => {
            console.error('Fehler beim Aktualisieren des Ortes:', error);
            alert('Fehler beim Aktualisieren des Ortes');
          }
        });
      }
    });
  }

  addLocation(): void {
    const dialogRef = this.dialog.open(LocationDialogComponent, {
      width: '400px',
      data: { location: null }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.locationService.addLocation(result).subscribe({
          next: () => {
            this.loadLocations();
          },
          error: (error) => {
            console.error('Fehler beim Hinzufügen des Ortes:', error);
            alert('Fehler beim Hinzufügen des Ortes');
          }
        });
      }
    });
  }
}
