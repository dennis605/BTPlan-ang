import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { DailySchedule } from '../models/daily-schedule';
import { TherapyService } from './therapy.service';
import { Therapy } from '../models/therapy';

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
    // Füge die Therapien einzeln hinzu
    const therapyObservables = schedule.therapies.map(therapy => 
      this.therapyService.addTherapy(therapy)
    );

    // Warte auf alle Therapie-Hinzufügungen
    return new Observable<DailySchedule>(observer => {
      Promise.all(therapyObservables.map(obs => 
        obs.toPromise().then(therapy => therapy as Therapy)
      )).then(
        (therapies) => {
          const newSchedule: DailySchedule = {
            date: schedule.date,
            therapies: therapies.filter((t): t is Therapy => t !== undefined)
          };
          observer.next(newSchedule);
          observer.complete();
        },
        (error) => {
          observer.error(error);
        }
      );
    });
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
}
