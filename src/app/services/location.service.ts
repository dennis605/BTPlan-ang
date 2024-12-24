import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Location } from '../models/location';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private locations: Location[] = [];
  private nextId = 1;

  constructor() {}

  getLocations(): Observable<Location[]> {
    return of(this.locations);
  }

  getLocation(id: number): Observable<Location | undefined> {
    return of(this.locations.find(location => location.id === id));
  }

  addLocation(location: Location): Observable<Location> {
    location.id = this.nextId++;
    this.locations.push(location);
    return of(location);
  }

  updateLocation(location: Location): Observable<Location> {
    const index = this.locations.findIndex(l => l.id === location.id);
    if (index !== -1) {
      this.locations[index] = location;
      return of(location);
    }
    return of(location);
  }

  deleteLocation(id: number): Observable<void> {
    const index = this.locations.findIndex(location => location.id === id);
    if (index !== -1) {
      this.locations.splice(index, 1);
    }
    return of(void 0);
  }
}
