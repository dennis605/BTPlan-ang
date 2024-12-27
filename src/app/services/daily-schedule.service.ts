import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of, forkJoin } from 'rxjs';
import { DailySchedule } from '../models/daily-schedule';
import { TherapyService } from './therapy.service';
import { Therapy } from '../models/therapy';
import moment from 'moment';

@Injectable({
  providedIn: 'root'
})
export class DailyScheduleService {
  private apiUrl = 'http://localhost:3000';

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
    // Erstelle ein Array von Observables für jede Therapie
    const therapyObservables = schedule.therapies.map(therapy => {
      const formattedTherapy = {
        ...therapy,
        startTime: moment(therapy.startTime).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
        endTime: moment(therapy.endTime).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
      };
      return this.therapyService.addTherapy(formattedTherapy);
    });

    // Verwende forkJoin statt Promise.all
    return forkJoin(therapyObservables).pipe(
      map(therapies => ({
        date: schedule.date,
        therapies: therapies
      }))
    );
  }

  updateSchedule(schedule: DailySchedule): Observable<DailySchedule> {
    return this.http.put<DailySchedule>(`${this.apiUrl}/${schedule.id}`, schedule);
  }

  updateTherapy(therapy: Therapy): Observable<Therapy> {
    return this.therapyService.updateTherapy(therapy);
  }

  deleteSchedule(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  deleteTherapy(therapyId: number): Observable<void> {
    return this.therapyService.deleteTherapy(therapyId);
  }

  createTherapy(therapy: Therapy): Observable<Therapy> {
    const formattedTherapy = {
      ...therapy,
      startTime: moment(therapy.startTime).format('YYYY-MM-DDTHH:mm:ss.SSSZ'),
      endTime: moment(therapy.endTime).format('YYYY-MM-DDTHH:mm:ss.SSSZ')
    };
    return this.http.post<Therapy>(`${this.apiUrl}/therapies`, formattedTherapy).pipe(
      map(response => ({
        ...response,
        startTime: new Date(response.startTime),
        endTime: new Date(response.endTime)
      }))
    );
  }
}
