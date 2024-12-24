import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { DailySchedule } from '../models/daily-schedule';
import { TherapyService } from './therapy.service';

@Injectable({
  providedIn: 'root'
})
export class DailyScheduleService {
  private apiUrl = 'http://localhost:3000/dailySchedules';

  constructor(
    private http: HttpClient,
    private therapyService: TherapyService
  ) {}

  getSchedules(): Observable<DailySchedule[]> {
    return this.http.get<DailySchedule[]>(this.apiUrl);
  }

  getSchedule(id: number): Observable<DailySchedule> {
    return this.http.get<DailySchedule>(`${this.apiUrl}/${id}`);
  }

  getScheduleByDate(date: Date): Observable<DailySchedule | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    return this.therapyService.getTherapiesByDate(date).pipe(
      map(therapies => {
        if (therapies.length === 0) {
          return undefined;
        }

        const schedule: DailySchedule = {
          date: date,
          therapies: therapies
        };

        return schedule;
      })
    );
  }

  addSchedule(schedule: DailySchedule): Observable<DailySchedule> {
    return this.http.post<DailySchedule>(this.apiUrl, schedule);
  }

  updateSchedule(schedule: DailySchedule): Observable<DailySchedule> {
    return this.http.put<DailySchedule>(`${this.apiUrl}/${schedule.id}`, schedule);
  }

  deleteSchedule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
