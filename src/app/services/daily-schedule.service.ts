import { Injectable } from '@angular/core';
import { Observable, map, switchMap, of, forkJoin } from 'rxjs';
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
    return this.electronService.getAll<{ id: string; date: string; therapies: string[] }>(this.collection).pipe(
      switchMap(schedules => {
        const therapyObservables = schedules.map(schedule => 
          forkJoin(schedule.therapies.map((therapyId: string) => 
            this.therapyService.getTherapy(therapyId)
          )).pipe(
            map(therapies => ({
              ...schedule,
              therapies: therapies.filter((t): t is Therapy => t !== null)
            }))
          )
        );
        return forkJoin(therapyObservables);
      })
    );
  }

  getDailySchedule(id: string): Observable<DailySchedule | null> {
    return this.electronService.getAll<{ id: string; date: string; therapies: string[] }>(this.collection).pipe(
      switchMap(schedules => {
        const schedule = schedules.find(s => s.id === id);
        if (!schedule) return of(null);
        
        return forkJoin(schedule.therapies.map((therapyId: string) => 
          this.therapyService.getTherapy(therapyId)
        )).pipe(
          map(therapies => ({
            ...schedule,
            therapies: therapies.filter((t): t is Therapy => t !== null)
          }))
        );
      })
    );
  }

  getScheduleByDate(date: Date): Observable<DailySchedule | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.getDailySchedules().pipe(
      map(schedules => schedules.find(s => {
        const scheduleDate = new Date(s.date);
        return scheduleDate >= startOfDay && scheduleDate <= endOfDay;
      })),
      switchMap(schedule => {
        if (schedule) {
          return of(schedule);
        }
        return this.therapyService.getTherapiesByDate(date).pipe(
          map((therapies: Therapy[]) => {
            if (therapies.length === 0) {
              return undefined;
            }

            // Sortiere Therapien nach Startzeit
            const sortedTherapies = therapies.sort((a: Therapy, b: Therapy) => 
              new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
            );

            // Erstelle einen neuen Tagesplan ohne ihn zu speichern
            return {
              id: crypto.randomUUID(),
              date: date.toISOString(),
              therapies: sortedTherapies
            };
          })
        );
      })
    );
  }

  addDailySchedule(schedule: DailySchedule): Observable<DailySchedule> {
    // Generiere eine neue ID für neue Tagespläne
    const scheduleToAdd = {
      id: schedule.id || crypto.randomUUID(),
      date: new Date(schedule.date).toISOString(),
      therapies: schedule.therapies.map(therapy => therapy.id)
    };
    return this.electronService.add(this.collection, scheduleToAdd).pipe(
      map(savedSchedule => ({
        ...schedule,
        id: savedSchedule.id,
        date: savedSchedule.date
      }))
    );
  }

  updateDailySchedule(schedule: DailySchedule): Observable<DailySchedule> {
    const id = schedule.id;
    const scheduleToUpdate = {
      id: schedule.id,
      date: new Date(schedule.date).toISOString(),
      therapies: schedule.therapies.map(therapy => therapy.id)
    };
    return this.electronService.update(this.collection, id, scheduleToUpdate).pipe(
      map(savedSchedule => ({
        ...schedule,
        id: savedSchedule.id,
        date: savedSchedule.date
      }))
    );
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
