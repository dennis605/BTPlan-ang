import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Location } from '../../../models/location';
import { LocationService } from '../../../services/location.service';
import { LocationDialogComponent } from '../location-dialog/location-dialog.component';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-location-list',
  templateUrl: './location-list.component.html',
  styleUrls: ['./location-list.component.scss'],
  standalone: true,
  imports: [
    MaterialModule,
    CommonModule
  ]
})
export class LocationListComponent implements OnInit {
  locations: Location[] = [];
  displayedColumns: string[] = ['name', 'description', 'actions'];

  constructor(
    private locationService: LocationService,
    private dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadLocations();
  }

  loadLocations(): void {
    this.locationService.getLocations().subscribe(locations => {
      console.log('Geladene Orte:', locations);
      this.locations = locations;
    });
  }

  openDialog(location?: Location): void {
    const dialogRef = this.dialog.open(LocationDialogComponent, {
      width: '400px',
      data: location || { id: crypto.randomUUID(), name: '', description: '' }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          // Ort aktualisieren
          this.locationService.updateLocation(result).subscribe({
            next: () => {
              this.loadLocations();
            },
            error: (error) => {
              console.error('Fehler beim Aktualisieren des Ortes:', error);
              alert('Fehler beim Aktualisieren des Ortes');
            }
          });
        } else {
          // Neuen Ort hinzufügen
          this.locationService.addLocation(result).subscribe({
            next: (newLocation) => {
              console.log('Neuer Ort erstellt:', newLocation);
              this.loadLocations();
            },
            error: (error) => {
              console.error('Fehler beim Hinzufügen des Ortes:', error);
              alert('Fehler beim Hinzufügen des Ortes');
            }
          });
        }
      }
    });
  }

  deleteLocation(id: string): void {
    if (!id || id.trim() === '') {
      console.error('Keine gültige ID zum Löschen vorhanden');
      return;
    }

    if (confirm('Sind Sie sicher, dass Sie diesen Ort löschen möchten?')) {
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
}
