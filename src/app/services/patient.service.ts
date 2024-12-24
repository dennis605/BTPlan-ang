import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { Patient } from '../models/patient';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private patients: Patient[] = [];
  private patientsSubject = new BehaviorSubject<Patient[]>([]);

  constructor() {
    // Initial dummy data
    this.addPatient({
      id: 1,
      name: 'Erika',
      surname: 'Musterfrau',
      note: 'Regelmäßige Teilnahme'
    });
  }

  getPatients(): Observable<Patient[]> {
    return this.patientsSubject.asObservable();
  }

  getPatient(id: number): Observable<Patient | undefined> {
    return of(this.patients.find(patient => patient.id === id));
  }

  addPatient(patient: Patient): void {
    // Generate ID if not provided
    if (!patient.id) {
      patient.id = this.patients.length + 1;
    }
    this.patients.push(patient);
    this.patientsSubject.next([...this.patients]);
  }

  updatePatient(patient: Patient): void {
    const index = this.patients.findIndex(p => p.id === patient.id);
    if (index !== -1) {
      this.patients[index] = patient;
      this.patientsSubject.next([...this.patients]);
    }
  }

  deletePatient(id: number): void {
    const index = this.patients.findIndex(patient => patient.id === id);
    if (index !== -1) {
      this.patients.splice(index, 1);
      this.patientsSubject.next([...this.patients]);
    }
  }
}
