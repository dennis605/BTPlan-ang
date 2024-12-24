import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { DailySchedule } from '../models/daily-schedule';
import { TherapyService } from './therapy.service';
import { map, switchMap } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class DailyScheduleService {
  private schedules: DailySchedule[] = [];
  private schedulesSubject = new BehaviorSubject<DailySchedule[]>([]);

  constructor(private therapyService: TherapyService) {
    // Initial dummy data
    const today = new Date();
    this.therapyService.getTherapiesByDate(today).subscribe(therapies => {
      if (therapies.length > 0) {
        this.addSchedule({
          id: 1,
          date: today,
          therapies: therapies
        });
      }
    });
  }

  getSchedules(): Observable<DailySchedule[]> {
    return this.schedulesSubject.asObservable();
  }

  getSchedule(id: number): Observable<DailySchedule | undefined> {
    return of(this.schedules.find(schedule => schedule.id === id));
  }

  getScheduleByDate(date: Date): Observable<DailySchedule | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);

    return this.therapyService.getTherapiesByDate(date).pipe(
      map(therapies => {
        let schedule = this.schedules.find(s => {
          const scheduleDate = new Date(s.date);
          scheduleDate.setHours(0, 0, 0, 0);
          return scheduleDate.getTime() === startOfDay.getTime();
        });

        if (!schedule && therapies.length > 0) {
          schedule = {
            id: this.schedules.length + 1,
            date: date,
            therapies: therapies
          };
          this.addSchedule(schedule);
        }

        return schedule;
      })
    );
  }

  addSchedule(schedule: DailySchedule): void {
    // Generate ID if not provided
    if (!schedule.id) {
      schedule.id = this.schedules.length + 1;
    }
    this.schedules.push(schedule);
    this.schedulesSubject.next([...this.schedules]);
  }

  updateSchedule(schedule: DailySchedule): void {
    const index = this.schedules.findIndex(s => s.id === schedule.id);
    if (index !== -1) {
      this.schedules[index] = schedule;
      this.schedulesSubject.next([...this.schedules]);
    }
  }

  deleteSchedule(id: number): void {
    const index = this.schedules.findIndex(schedule => schedule.id === id);
    if (index !== -1) {
      this.schedules.splice(index, 1);
      this.schedulesSubject.next([...this.schedules]);
    }
  }
}
