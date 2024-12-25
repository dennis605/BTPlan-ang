import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TherapyService } from '../../services/therapy.service';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient';
import { Therapy } from '../../models/therapy';

interface PatientStatistics {
  patient: Patient;
  totalHours: number;
  therapyCount: number;
}

@Component({
  selector: 'app-statistics',
  templateUrl: './statistics.component.html',
  styleUrls: ['./statistics.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatInputModule,
    MatButtonModule,
    MatTableModule,
    MatProgressSpinnerModule
  ]
})
export class StatisticsComponent implements OnInit {
  patients: Patient[] = [];
  selectedPatient?: Patient;
  startDate: Date = new Date();
  endDate: Date = new Date();
  statistics: PatientStatistics[] = [];
  isLoading = false;
  displayedColumns: string[] = ['patient', 'therapyCount', 'totalHours'];

  constructor(
    private therapyService: TherapyService,
    private patientService: PatientService
  ) {
    // Setze Startdatum auf Anfang des aktuellen Monats
    this.startDate.setDate(1);
    // Setze Enddatum auf Ende des aktuellen Monats
    this.endDate = new Date(this.startDate.getFullYear(), this.startDate.getMonth() + 1, 0);
  }

  ngOnInit(): void {
    this.loadPatients();
  }

  loadPatients(): void {
    this.patientService.getPatients().subscribe(patients => {
      this.patients = patients;
    });
  }

  calculateStatistics(): void {
    this.isLoading = true;
    this.statistics = [];

    this.therapyService.getTherapies().subscribe({
      next: (therapies) => {
        const filteredTherapies = therapies.filter(therapy => {
          const therapyDate = new Date(therapy.startTime);
          return therapyDate >= this.startDate && therapyDate <= this.endDate;
        });

        // Wenn ein Patient ausgewählt ist, nur für diesen berechnen
        const patientsToAnalyze = this.selectedPatient 
          ? [this.selectedPatient] 
          : this.patients;

        this.statistics = patientsToAnalyze.map(patient => {
          const patientTherapies = filteredTherapies.filter(therapy =>
            therapy.patients.some(p => p.id === patient.id)
          );

          const totalMinutes = patientTherapies.reduce((total, therapy) => {
            const start = new Date(therapy.startTime);
            const end = new Date(therapy.endTime);
            const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
            return total + durationInMinutes;
          }, 0);

          return {
            patient,
            totalHours: Math.round((totalMinutes / 60) * 100) / 100, // Runde auf 2 Dezimalstellen
            therapyCount: patientTherapies.length
          };
        });
      },
      error: (error) => {
        console.error('Fehler beim Laden der Therapien:', error);
        alert('Fehler beim Laden der Therapien');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  formatName(patient: Patient): string {
    return `${patient.name} ${patient.surname}`;
  }
}
