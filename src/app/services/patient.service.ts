import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { Patient } from '../models/patient';
import { ElectronService } from './electron.service';

@Injectable({
  providedIn: 'root'
})
export class PatientService {
  private readonly collection = 'patients';

  constructor(private electronService: ElectronService) {}

  getPatients(): Observable<Patient[]> {
    return this.electronService.getAll<Patient>(this.collection);
  }

  getPatient(id: string): Observable<Patient | null> {
    return this.electronService.getAll<Patient>(this.collection)
      .pipe(
        map(patients => patients.find(pat => pat.id === id) || null)
      );
  }

  addPatient(patient: Patient): Observable<Patient> {
    // Generiere eine neue ID für neue Patienten
    const patientToAdd: Patient = {
      ...patient,
      id: patient.id || crypto.randomUUID()
    };
    return this.electronService.add<Patient>(this.collection, patientToAdd);
  }

  updatePatient(patient: Patient): Observable<Patient> {
    const id = patient.id;
    return this.electronService.update<Patient>(this.collection, id, patient);
  }

  deletePatient(id: string): Observable<string> {
    return this.electronService.delete(this.collection, id);
  }
}
