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
  imports: [MaterialModule, CommonModule]
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
      this.locations = locations;
    });
  }

  openDialog(location?: Location): void {
    const dialogRef = this.dialog.open(LocationDialogComponent, {
      width: '400px',
      data: location || {}
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        if (result.id) {
          this.locationService.updateLocation(result).subscribe(() => {
            this.loadLocations();
          });
        } else {
          this.locationService.addLocation(result).subscribe(() => {
            this.loadLocations();
          });
        }
      }
    });
  }

  deleteLocation(id: number): void {
    if (confirm('Sind Sie sicher, dass Sie diesen Ort löschen möchten?')) {
      this.locationService.deleteLocation(id).subscribe(() => {
        this.loadLocations();
      });
    }
  }
}
