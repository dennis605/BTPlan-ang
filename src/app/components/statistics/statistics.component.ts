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
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { TherapyService } from '../../services/therapy.service';
import { PatientService } from '../../services/patient.service';
import { Patient } from '../../models/patient';
import { Therapy } from '../../models/therapy';
import { TherapyDetail } from '../../models/therapy-detail';
import { StatisticsDetailDialogComponent } from './statistics-detail-dialog/statistics-detail-dialog.component';

interface PatientStatistics {
  patient: Patient;
  totalHours: number;
  therapyCount: number;
  therapyDetails: TherapyDetail[];
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
    MatProgressSpinnerModule,
    MatDialogModule,
    MatIconModule
  ]
})
export class StatisticsComponent implements OnInit {
  patients: Patient[] = [];
  selectedPatients: Patient[] = [];
  startDate: Date = new Date();
  endDate: Date = new Date();
  statistics: PatientStatistics[] = [];
  isLoading = false;
  displayedColumns: string[] = ['patient', 'therapyCount', 'totalHours', 'actions'];

  constructor(
    private therapyService: TherapyService,
    private patientService: PatientService,
    private dialog: MatDialog
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
          const startOfDay = new Date(this.startDate);
          startOfDay.setHours(0, 0, 0, 0);
          const endOfDay = new Date(this.endDate);
          endOfDay.setHours(23, 59, 59, 999);
          return therapyDate >= startOfDay && therapyDate <= endOfDay;
        });

        // Wenn Patienten ausgewählt sind, nur für diese berechnen
        const patientsToAnalyze = this.selectedPatients.length > 0
          ? this.selectedPatients
          : this.patients;

        this.statistics = patientsToAnalyze.map(patient => {
          const patientTherapies = filteredTherapies.filter(therapy =>
            therapy.patients.some(p => p.id === patient.id)
          );

          const therapyDetails: TherapyDetail[] = patientTherapies.map(therapy => {
            const start = new Date(therapy.startTime);
            const end = new Date(therapy.endTime);
            const durationInMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
            
            return {
              date: start,
              name: therapy.name,
              startTime: start,
              endTime: end,
              duration: durationInMinutes
            };
          });

          const totalMinutes = therapyDetails.reduce((total, detail) => total + detail.duration, 0);

          return {
            patient,
            totalHours: Math.round((totalMinutes / 60) * 100) / 100,
            therapyCount: patientTherapies.length,
            therapyDetails: therapyDetails.sort((a, b) => a.date.getTime() - b.date.getTime())
          };
        });
      },
      error: (error) => {
        console.error('Fehler beim Laden des Programms:', error);
        alert('Fehler beim Laden der Programme ');
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  showDetails(stat: PatientStatistics): void {
    this.dialog.open(StatisticsDetailDialogComponent, {
      width: '800px',
      data: {
        patient: stat.patient,
        therapyDetails: stat.therapyDetails,
        startDate: this.startDate,
        endDate: this.endDate
      }
    });
  }

  formatName(patient: Patient): string {
    return `${patient.name} ${patient.surname}`;
  }

  comparePatients(patient1: Patient, patient2: Patient): boolean {
    return patient1?.id === patient2?.id;
  }
}
