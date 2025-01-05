import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Location } from '../models/location';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private readonly collection = 'locations';

  constructor(private electronService: ElectronService) {}

  getLocations(): Observable<Location[]> {
    return this.electronService.getAll<Location>(this.collection);
  }

  getLocation(id: string): Observable<Location | null> {
    return this.electronService.getAll<Location>(this.collection)
      .pipe(
        map(locations => locations.find(loc => loc.id === id) || null)
      );
  }

  addLocation(location: Location): Observable<Location> {
    // Generiere eine neue ID für neue Standorte
    const locationToAdd: Location = {
      ...location,
      id: location.id || crypto.randomUUID()
    };
    return this.electronService.add<Location>(this.collection, locationToAdd);
  }

  updateLocation(location: Location): Observable<Location> {
    const id = location.id;
    return this.electronService.update<Location>(this.collection, id, location);
  }

  deleteLocation(id: string): Observable<string> {
    return this.electronService.delete(this.collection, id);
  }
}
