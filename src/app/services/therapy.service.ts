import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Therapy } from '../models/therapy';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class TherapyService {
  private readonly collection = 'therapies';

  constructor(private electronService: ElectronService) {}

  getTherapies(): Observable<Therapy[]> {
    return this.electronService.getAll<Therapy>(this.collection);
  }

  getTherapiesByDate(date: Date): Observable<Therapy[]> {
    console.log('Suche Therapien für Datum:', date);
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('Zeitraum:', startOfDay, 'bis', endOfDay);

    return this.getTherapies().pipe(
      map(therapies => {
        console.log('Alle Therapien:', therapies);
        const filteredTherapies = therapies.filter(therapy => {
          const therapyDate = new Date(therapy.startTime);
          console.log('Prüfe Therapie:', therapy.name, 'Datum:', therapyDate);
          return therapyDate >= startOfDay && therapyDate <= endOfDay;
        });
        console.log('Gefilterte Therapien:', filteredTherapies);
        return filteredTherapies;
      })
    );
  }

  getTherapy(id: string): Observable<Therapy | null> {
    return this.electronService.getAll<Therapy>(this.collection)
      .pipe(
        map(therapies => {
          const therapy = therapies.find(t => t.id === id);
          if (!therapy) return null;
          return {
            ...therapy,
            startTime: therapy.startTime,
            endTime: therapy.endTime
          };
        })
      );
  }

  addTherapy(therapy: Therapy): Observable<Therapy> {
    // Konvertiere zu DbTherapy Format und entferne _id
    const { _id, ...rest } = therapy as any;
    const therapyToAdd = {
      ...rest,
      id: therapy.id || crypto.randomUUID(),
      startTime: new Date(therapy.startTime).toISOString(),
      endTime: new Date(therapy.endTime).toISOString(),
      leadingEmployee: therapy.leadingEmployee || null,
      patients: therapy.patients || [],
      location: therapy.location || null
    };
    return this.electronService.add<Therapy>(this.collection, therapyToAdd).pipe(
      map((savedTherapy: Therapy) => ({
        ...therapy,
        id: savedTherapy.id,
        startTime: savedTherapy.startTime,
        endTime: savedTherapy.endTime
      }))
    );
  }

  updateTherapy(therapy: Therapy): Observable<Therapy> {
    // Konvertiere zu DbTherapy Format und entferne _id
    const { _id, ...rest } = therapy as any;
    const therapyToUpdate = {
      ...rest,
      id: therapy.id,
      startTime: new Date(therapy.startTime).toISOString(),
      endTime: new Date(therapy.endTime).toISOString(),
      leadingEmployee: therapy.leadingEmployee || null,
      patients: therapy.patients || [],
      location: therapy.location || null
    };
    return this.electronService.update<Therapy>(this.collection, therapy.id, therapyToUpdate).pipe(
      map((savedTherapy: Therapy) => ({
        ...therapy,
        id: savedTherapy.id,
        startTime: savedTherapy.startTime,
        endTime: savedTherapy.endTime
      }))
    );
  }

  deleteTherapy(id: string): Observable<string> {
    return this.electronService.delete(this.collection, id);
  }

  // Hilfsmethode zum Duplizieren einer Therapie
  duplicateTherapy(therapy: Therapy, newDate: Date): Observable<Therapy> {
    const duplicatedTherapy: Therapy = {
      ...therapy,
      id: crypto.randomUUID(),
      startTime: newDate.toISOString(),
      endTime: new Date(newDate.getTime() + (new Date(therapy.endTime).getTime() - new Date(therapy.startTime).getTime())).toISOString()
    };
    return this.addTherapy(duplicatedTherapy);
  }
}
