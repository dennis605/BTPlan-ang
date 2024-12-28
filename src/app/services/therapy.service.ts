import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Therapy } from '../models/therapy';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class TherapyService {
  private apiUrl = `${environment.apiUrl}/therapies`;

  constructor(private http: HttpClient) {}

  getTherapies(sortField?: string, sortOrder: 'asc' | 'desc' = 'asc'): Observable<Therapy[]> {
    let params = new HttpParams();
    
    if (sortField) {
      // JSON Server verwendet _sort und _order für Sortierung
      params = params
        .set('_sort', sortField)
        .set('_order', sortOrder);
    }
    
    return this.http.get<Therapy[]>(this.apiUrl, { params });
  }

  getTherapy(id: number): Observable<Therapy> {
    return this.http.get<Therapy>(`${this.apiUrl}/${id}`);
  }

  addTherapy(therapy: Therapy): Observable<Therapy> {
    return this.http.post<Therapy>(this.apiUrl, therapy);
  }

  updateTherapy(therapy: Therapy): Observable<Therapy> {
    return this.http.put<Therapy>(`${this.apiUrl}/${therapy.id}`, therapy);
  }

  deleteTherapy(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  duplicateTherapy(therapy: Therapy): Observable<Therapy> {
    // Erstelle eine Kopie der Therapie ohne ID
    const duplicatedTherapy: Therapy = {
      ...therapy,
      id: undefined, // ID wird vom Server generiert
      name: `${therapy.name}_copy`, // Füge _copy zum Namen hinzu
      startTime: new Date(therapy.startTime),
      endTime: new Date(therapy.endTime)
    };
    return this.addTherapy(duplicatedTherapy);
  }

  getTherapiesByDate(date: Date): Observable<Therapy[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    console.log('Filtering therapies for date range:', {
      date: date.toISOString(),
      startOfDay: startOfDay.toISOString(),
      endOfDay: endOfDay.toISOString()
    });

    return this.getTherapies().pipe(
      map(therapies => {
        console.log('All therapies:', therapies);
        
        const filteredTherapies = therapies.filter(therapy => {
          const therapyDate = new Date(therapy.startTime);
          const isInRange = therapyDate >= startOfDay && therapyDate <= endOfDay;
          
          console.log('Checking therapy:', {
            name: therapy.name,
            startTime: therapy.startTime,
            therapyDate: therapyDate.toISOString(),
            isInRange
          });
          
          return isInRange;
        });

        console.log('Filtered therapies:', filteredTherapies);
        return filteredTherapies;
      })
    );
  }
}
