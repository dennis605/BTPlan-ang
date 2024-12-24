import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Therapy } from '../models/therapy';

@Injectable({
  providedIn: 'root'
})
export class TherapyService {
  private apiUrl = 'http://localhost:3000/therapies';

  constructor(private http: HttpClient) {}

  getTherapies(): Observable<Therapy[]> {
    return this.http.get<Therapy[]>(this.apiUrl);
  }

  getTherapy(id: number): Observable<Therapy> {
    return this.http.get<Therapy>(`${this.apiUrl}/${id}`);
  }

  addTherapy(therapy: Therapy): Observable<Therapy> {
    return this.http.post<Therapy>(this.apiUrl, therapy);
  }

  updateTherapy(therapy: Therapy): Observable<Therapy> {
    return this.http.put<Therapy>(`${this.apiUrl}/${therapy.id}`, therapy);
  }

  deleteTherapy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTherapiesByDate(date: Date): Observable<Therapy[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getTherapies().pipe(
      map(therapies => therapies.filter(therapy => {
        const therapyDate = new Date(therapy.time);
        return therapyDate >= startOfDay && therapyDate <= endOfDay;
      }))
    );
  }
}
