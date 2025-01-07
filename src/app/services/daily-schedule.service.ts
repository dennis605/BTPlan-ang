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
        // Sammle alle einzigartigen Therapie-IDs
        const allTherapyIds = [...new Set(schedules.flatMap(s => s.therapies))];
        
        // Lade alle Therapien auf einmal
        return this.therapyService.getTherapies().pipe(
          map(allTherapies => {
            // Erstelle eine Map für schnellen Zugriff
            const therapyMap = new Map(allTherapies.map(t => [t.id, t]));
            
            // Wandle die Schedules um und sortiere die Therapien nach Startzeit
            return schedules.map(schedule => ({
              ...schedule,
              therapies: schedule.therapies
                .map(id => therapyMap.get(id))
                .filter((t): t is Therapy => t !== undefined)
                .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
            }));
          })
        );
      })
    );
  }

  getDailySchedule(id: string): Observable<DailySchedule | null> {
    return this.electronService.getAll<{ id: string; date: string; therapies: string[] }>(this.collection).pipe(
      switchMap(schedules => {
        const schedule = schedules.find(s => s.id === id);
        if (!schedule) return of(null);
        
        // Lade alle Therapien auf einmal
        return this.therapyService.getTherapies().pipe(
          map(allTherapies => {
            // Erstelle eine Map für schnellen Zugriff
            const therapyMap = new Map(allTherapies.map(t => [t.id, t]));
            
            // Wandle den Schedule um
            return {
              ...schedule,
              therapies: schedule.therapies
                .map(id => therapyMap.get(id))
                .filter((t): t is Therapy => t !== undefined)
            };
          })
        );
      })
    );
  }

  getScheduleByDate(date: Date): Observable<DailySchedule | undefined> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    return this.therapyService.getTherapiesByDate(date).pipe(
      switchMap(therapies => {
        if (therapies.length === 0) {
          // Wenn keine Therapien existieren, lösche einen möglicherweise existierenden leeren Schedule
          return this.getDailySchedules().pipe(
            switchMap(schedules => {
              const existingSchedule = schedules.find(s => {
                const scheduleDate = new Date(s.date);
                return scheduleDate >= startOfDay && scheduleDate <= endOfDay;
              });
              
              if (existingSchedule) {
                return this.deleteDailySchedule(existingSchedule.id).pipe(
                  map(() => undefined)
                );
              }
              
              return of(undefined);
            })
          );
        }

        // Sortiere Therapien nach Startzeit
        const sortedTherapies = therapies.sort((a, b) => 
          new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
        );

        return this.getDailySchedules().pipe(
          switchMap(schedules => {
            const existingSchedule = schedules.find(s => {
              const scheduleDate = new Date(s.date);
              return scheduleDate >= startOfDay && scheduleDate <= endOfDay;
            });

            if (existingSchedule) {
              // Update existierenden Schedule
              const updatedSchedule: DailySchedule = {
                ...existingSchedule,
                therapies: sortedTherapies
              };
              return this.updateDailySchedule(updatedSchedule);
            } else {
              // Erstelle neuen Schedule
              const newSchedule: DailySchedule = {
                id: crypto.randomUUID(),
                date: date.toISOString(),
                therapies: sortedTherapies
              };
              return this.addDailySchedule(newSchedule);
            }
          })
        );
      })
    );
  }

  addDailySchedule(schedule: DailySchedule): Observable<DailySchedule> {
    if (schedule.therapies.length === 0) {
      return of(schedule);
    }

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
    if (schedule.therapies.length === 0) {
      return this.deleteDailySchedule(schedule.id).pipe(
        map(() => schedule)
      );
    }

    const scheduleToUpdate = {
      id: schedule.id,
      date: new Date(schedule.date).toISOString(),
      therapies: schedule.therapies.map(therapy => therapy.id)
    };
    return this.electronService.update(this.collection, schedule.id, scheduleToUpdate).pipe(
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

  duplicateDailySchedule(schedule: DailySchedule, newDate: Date): Observable<DailySchedule> {
    // Zuerst die Therapien duplizieren und speichern
    const therapyObservables = schedule.therapies.map(therapy => {
      const duplicatedTherapy = {
        ...therapy,
        id: crypto.randomUUID(),
        startTime: this.adjustDate(therapy.startTime, schedule.date, newDate.toISOString()),
        endTime: this.adjustDate(therapy.endTime, schedule.date, newDate.toISOString())
      };
      return this.therapyService.addTherapy(duplicatedTherapy);
    });

    // Wenn alle Therapien gespeichert sind, prüfen ob bereits ein Tagesplan existiert
    return forkJoin(therapyObservables).pipe(
      switchMap(savedTherapies => {
        return this.getScheduleByDate(newDate).pipe(
          switchMap(existingSchedule => {
            if (existingSchedule) {
              // Wenn ein Tagesplan existiert, einfach alle neuen Therapien hinzufügen
              const updatedSchedule: DailySchedule = {
                ...existingSchedule,
                therapies: [...existingSchedule.therapies, ...savedTherapies].sort((a, b) => 
                  new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                )
              };
              return this.updateDailySchedule(updatedSchedule);
            } else {
              // Wenn kein Tagesplan existiert, einen neuen erstellen
              const duplicatedSchedule: DailySchedule = {
                ...schedule,
                id: crypto.randomUUID(),
                date: newDate.toISOString(),
                therapies: savedTherapies.sort((a, b) => 
                  new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
                )
              };
              return this.addDailySchedule(duplicatedSchedule);
            }
          })
        );
      })
    );
  }

  private adjustDate(time: string, oldDate: string, newDate: string): string {
    const oldDateTime = new Date(time);
    const oldScheduleDate = new Date(oldDate);
    const newScheduleDate = new Date(newDate);
    const timeDiff = oldDateTime.getTime() - oldScheduleDate.getTime();
    return new Date(newScheduleDate.getTime() + timeDiff).toISOString();
  }
}
