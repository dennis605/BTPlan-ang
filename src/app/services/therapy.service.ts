import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Therapy } from '../models/therapy';
import { EmployeeService } from './employee.service';
import { PatientService } from './patient.service';

@Injectable({
  providedIn: 'root'
})
export class TherapyService {
  private therapies: Therapy[] = [];
  private therapiesSubject = new BehaviorSubject<Therapy[]>([]);

  constructor(
    private employeeService: EmployeeService,
    private patientService: PatientService
  ) {
    // Initial dummy data
    this.employeeService.getEmployees().subscribe(employees => {
      if (employees.length > 0) {
        this.patientService.getPatients().subscribe(patients => {
          if (patients.length > 0) {
            this.addTherapy({
              id: 1,
              name: 'Gruppentherapie',
              patients: [patients[0]],
              leadingEmployee: employees[0],
              location: 'Raum 101',
              time: new Date(),
              preparationTime: 15,
              followUpTime: 10,
              therapyType: 'Gruppe'
            });
          }
        });
      }
    });
  }

  getTherapies(): Observable<Therapy[]> {
    return this.therapiesSubject.asObservable();
  }

  getTherapy(id: number): Observable<Therapy | undefined> {
    return of(this.therapies.find(therapy => therapy.id === id));
  }

  addTherapy(therapy: Therapy): void {
    // Generate ID if not provided
    if (!therapy.id) {
      therapy.id = this.therapies.length + 1;
    }
    this.therapies.push(therapy);
    this.therapiesSubject.next([...this.therapies]);
  }

  updateTherapy(therapy: Therapy): void {
    const index = this.therapies.findIndex(t => t.id === therapy.id);
    if (index !== -1) {
      this.therapies[index] = therapy;
      this.therapiesSubject.next([...this.therapies]);
    }
  }

  deleteTherapy(id: number): void {
    const index = this.therapies.findIndex(therapy => therapy.id === id);
    if (index !== -1) {
      this.therapies.splice(index, 1);
      this.therapiesSubject.next([...this.therapies]);
    }
  }

  getTherapiesByDate(date: Date): Observable<Therapy[]> {
    const startOfDay = new Date(date);
    startOfDay.setHours(0, 0, 0, 0);
    
    const endOfDay = new Date(date);
    endOfDay.setHours(23, 59, 59, 999);

    const filteredTherapies = this.therapies.filter(therapy => {
      const therapyDate = new Date(therapy.time);
      return therapyDate >= startOfDay && therapyDate <= endOfDay;
    });

    return of(filteredTherapies);
  }
}
