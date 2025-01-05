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
    return this.electronService.getAll<Therapy>(this.collection)
      .pipe(
        map(therapies => therapies.map(therapy => ({
          ...therapy,
          startTime: therapy.startTime,
          endTime: therapy.endTime
        })))
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
    // Generiere eine neue ID für neue Therapien
    const therapyToAdd: Therapy = {
      ...therapy,
      id: therapy.id || crypto.randomUUID(),
      startTime: new Date(therapy.startTime).toISOString(),
      endTime: new Date(therapy.endTime).toISOString()
    };
    return this.electronService.add<Therapy>(this.collection, therapyToAdd);
  }

  updateTherapy(therapy: Therapy): Observable<Therapy> {
    const id = therapy.id;
    const therapyToUpdate: Therapy = {
      ...therapy,
      startTime: new Date(therapy.startTime).toISOString(),
      endTime: new Date(therapy.endTime).toISOString()
    };
    return this.electronService.update<Therapy>(this.collection, id, therapyToUpdate);
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
