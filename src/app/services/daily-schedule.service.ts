import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { DailySchedule } from '../models/daily-schedule';
import { Therapy } from '../models/therapy';
import { environment } from '../../environments/environment';
import dayjs from 'dayjs';

@Injectable({
  providedIn: 'root'
})
export class DailyScheduleService {
  private apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  getSchedules(): Observable<DailySchedule[]> {
    return this.http.get<DailySchedule[]>(`${this.apiUrl}/dailySchedules`);
  }

  getSchedule(id: number): Observable<DailySchedule> {
    return this.http.get<DailySchedule>(`${this.apiUrl}/dailySchedules/${id}`);
  }

  getScheduleByDate(date: Date): Observable<DailySchedule | null> {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    return this.http.get<DailySchedule[]>(`${this.apiUrl}/dailySchedules`).pipe(
      map(schedules => {
        const schedule = schedules.find(s => 
          dayjs(s.date).format('YYYY-MM-DD') === formattedDate
        );
        return schedule || null;
      })
    );
  }

  addSchedule(schedule: DailySchedule): Observable<DailySchedule> {
    return this.http.post<DailySchedule>(`${this.apiUrl}/dailySchedules`, schedule);
  }

  updateSchedule(schedule: DailySchedule): Observable<DailySchedule> {
    return this.http.put<DailySchedule>(`${this.apiUrl}/dailySchedules/${schedule.id}`, schedule);
  }

  deleteSchedule(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/dailySchedules/${id}`);
  }

  // Therapie-bezogene Methoden
  getTherapies(): Observable<Therapy[]> {
    return this.http.get<Therapy[]>(`${this.apiUrl}/therapies`);
  }

  getTherapiesByDate(date: Date): Observable<Therapy[]> {
    const formattedDate = dayjs(date).format('YYYY-MM-DD');
    return this.http.get<Therapy[]>(`${this.apiUrl}/therapies`).pipe(
      map(therapies => therapies.filter(therapy => 
        dayjs(therapy.startTime).format('YYYY-MM-DD') === formattedDate
      ))
    );
  }

  createTherapy(therapy: Therapy): Observable<Therapy> {
    return this.http.post<Therapy>(`${this.apiUrl}/therapies`, therapy);
  }

  updateTherapy(therapy: Therapy): Observable<Therapy> {
    return this.http.put<Therapy>(`${this.apiUrl}/therapies/${therapy.id}`, therapy);
  }

  deleteTherapy(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/therapies/${id}`);
  }
}
