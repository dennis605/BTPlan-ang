import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Location } from '../models/location';

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = 'http://localhost:3000/locations';

  constructor(private http: HttpClient) {}

  getLocations(): Observable<Location[]> {
    return this.http.get<Location[]>(this.apiUrl);
  }

  getLocation(id: number): Observable<Location> {
    return this.http.get<Location>(`${this.apiUrl}/${id}`);
  }

  addLocation(location: Location): Observable<Location> {
    // Generate a random 4-character hex ID (similar to other IDs in db.json)
    const newLocation = {
      ...location,
      id: Math.random().toString(16).substring(2, 6)
    };
    return this.http.post<Location>(this.apiUrl, newLocation);
  }

  updateLocation(location: Location): Observable<Location> {
    return this.http.put<Location>(`${this.apiUrl}/${location.id}`, location);
  }

  deleteLocation(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
