import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { Therapy } from '../models/therapy';
import { environment } from '../../environments/environment';
import * as dayjs from 'dayjs';

@Injectable({
  providedIn: 'root'
})
export class TherapyService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getTherapies(): Observable<Therapy[]> {
    return this.http.get<Therapy[]>(`${this.apiUrl}/therapies`);
  }

  getTherapiesByDate(date: Date): Observable<Therapy[]> {
    const targetDate = dayjs(date).format('YYYY-MM-DD');
    return this.http.get<Therapy[]>(`${this.apiUrl}/therapies`).pipe(
      map(therapies => therapies.filter(therapy => {
        const therapyDate = dayjs(therapy.startTime).format('YYYY-MM-DD');
        return therapyDate === targetDate;
      }))
    );
  }

  getTherapyById(id: number): Observable<Therapy> {
    return this.http.get<Therapy>(`${this.apiUrl}/therapies/${id}`);
  }

  createTherapy(therapy: Therapy): Observable<Therapy> {
    return this.http.post<Therapy>(`${this.apiUrl}/therapies`, therapy);
  }

  updateTherapyById(therapy: Therapy): Observable<Therapy> {
    return this.http.put<Therapy>(`${this.apiUrl}/therapies/${therapy.id}`, therapy);
  }

  deleteTherapyById(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/therapies/${id}`);
  }
}
