import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { DailySchedule } from '../models/daily-schedule';
import { Therapy } from '../models/therapy';
import { ElectronService } from './electron.service';
import { TherapyService } from './therapy.service';

@Injectable({
  providedIn: 'root'
})
export class DailyScheduleService {
  private readonly collection = 'dailySchedules';

  constructor(
    private electronService: ElectronService,
    private therapyService: TherapyService
  ) {}

  getDailySchedules(): Observable<DailySchedule[]> {
    return this.electronService.getAll<DailySchedule>(this.collection);
  }

  getDailySchedule(id: string): Observable<DailySchedule | null> {
    return this.electronService.getAll<DailySchedule>(this.collection)
      .pipe(
        map(schedules => schedules.find(s => s.id === id) || null)
      );
  }

  getScheduleByDate(date: Date): Observable<DailySchedule | undefined> {
    return this.therapyService.getTherapiesByDate(date).pipe(
      map((therapies: Therapy[]) => {
        if (therapies.length === 0) {
          return undefined;
        }

        // Sortiere Therapien nach Startzeit
        const sortedTherapies = therapies.sort((a: Therapy, b: Therapy) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        return {
          id: crypto.randomUUID(),
          date: date.toISOString(),
          therapies: sortedTherapies
        };
      })
    );
  }

  addDailySchedule(schedule: DailySchedule): Observable<DailySchedule> {
    // Generiere eine neue ID für neue Tagespläne
    const scheduleToAdd: DailySchedule = {
      ...schedule,
      id: schedule.id || crypto.randomUUID(),
      date: new Date(schedule.date).toISOString()
    };
    return this.electronService.add<DailySchedule>(this.collection, scheduleToAdd);
  }

  updateDailySchedule(schedule: DailySchedule): Observable<DailySchedule> {
    const id = schedule.id;
    const scheduleToUpdate: DailySchedule = {
      ...schedule,
      date: new Date(schedule.date).toISOString()
    };
    return this.electronService.update<DailySchedule>(this.collection, id, scheduleToUpdate);
  }

  deleteDailySchedule(id: string): Observable<string> {
    return this.electronService.delete(this.collection, id);
  }

  // Hilfsmethode zum Duplizieren eines Tagesplans
  duplicateDailySchedule(schedule: DailySchedule, newDate: Date): Observable<DailySchedule> {
    const duplicatedSchedule: DailySchedule = {
      ...schedule,
      id: crypto.randomUUID(),
      date: newDate.toISOString(),
      therapies: schedule.therapies.map(therapy => ({
        ...therapy,
        id: crypto.randomUUID(),
        startTime: this.adjustDate(therapy.startTime, schedule.date, newDate.toISOString()),
        endTime: this.adjustDate(therapy.endTime, schedule.date, newDate.toISOString())
      }))
    };
    return this.addDailySchedule(duplicatedSchedule);
  }

  // Hilfsmethode zum Anpassen des Datums einer Therapie
  private adjustDate(time: string, oldDate: string, newDate: string): string {
    const oldDateTime = new Date(time);
    const oldScheduleDate = new Date(oldDate);
    const newScheduleDate = new Date(newDate);
    const timeDiff = oldDateTime.getTime() - oldScheduleDate.getTime();
    return new Date(newScheduleDate.getTime() + timeDiff).toISOString();
  }
}
