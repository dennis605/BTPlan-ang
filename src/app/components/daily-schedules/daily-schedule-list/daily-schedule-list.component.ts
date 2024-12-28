import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import { Router } from '@angular/router';
import dayjs from 'dayjs';
import 'dayjs/locale/de';
import { DailySchedule } from '../../../models/daily-schedule';
import { Therapy } from '../../../models/therapy';
import { DailyScheduleService } from '../../../services/daily-schedule.service';
import { DuplicateScheduleDialogComponent } from '../duplicate-schedule-dialog/duplicate-schedule-dialog.component';
import { DuplicateTherapyDialogComponent } from '../duplicate-therapy-dialog/duplicate-therapy-dialog.component';
import { EditTherapyDialogComponent } from '../edit-therapy-dialog/edit-therapy-dialog.component';
import { DailyScheduleDetailDialogComponent } from '../daily-schedule-detail-dialog/daily-schedule-detail-dialog.component';
import { forkJoin } from 'rxjs';
import { TherapyService } from '../../../services/therapy.service';

@Component({
  selector: 'app-daily-schedule-list',
  templateUrl: './daily-schedule-list.component.html',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,
    MatChipsModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  providers: [
    { provide: MAT_DATE_LOCALE, useValue: 'de-DE' },
    {
      provide: DateAdapter,
      useClass: MomentDateAdapter,
      deps: [MAT_DATE_LOCALE, MAT_MOMENT_DATE_ADAPTER_OPTIONS]
    },
    {
      provide: MAT_DATE_FORMATS,
      useValue: {
        parse: {
          dateInput: 'DD.MM.YYYY',
        },
        display: {
          dateInput: 'DD.MM.YYYY',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'DD.MM.YYYY',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    }
  ],
  styles: [`
    .daily-schedule-container {
      padding: 20px;
    }

    h2 {
      margin-bottom: 20px;
    }

    .date-selector {
      margin-bottom: 20px;
      padding: 16px;
    }

    .loading-spinner {
      display: flex;
      justify-content: center;
      padding: 20px;
    }

    .no-schedule {
      text-align: center;
      padding: 20px;
      color: rgba(0, 0, 0, 0.54);
    }

    .therapy-row {
      transition: background-color 0.2s ease;
    }

    .mat-column-patients mat-chip-set {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
    }

    .mat-column-patients mat-chip {
      font-size: 12px;
      height: 24px;
    }

    .time-details {
      color: #666;
      margin-top: 4px;
    }

    .ml-2 {
      margin-left: 8px;
    }

    .mat-mdc-table {
      width: 100%;
      margin-top: 16px;
    }

    .mat-mdc-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
    }

    .mat-column-actions {
      width: 100px;
      text-align: right;
    }

    button[mat-icon-button] {
      margin: 0 4px;
    }
  `]
})
export class DailyScheduleListComponent implements OnInit {
  schedules: DailySchedule[] = [];
  selectedDate: Date = new Date();
  isLoading = false;
  displayedColumns: string[] = [
    'time',
    'name',
    'leadingEmployee',
    'patients',
    'location',
    'preparationTime',
    'followUpTime',
    'comment',
    'actions'
  ];

  constructor(
    private dailyScheduleService: DailyScheduleService,
    private dialog: MatDialog,
    private router: Router,
    private therapyService: TherapyService
  ) {}

  ngOnInit(): void {
    dayjs.locale('de');
    this.selectedDate = new Date();
    this.loadDailySchedule();
  }

  loadDailySchedule(): void {
    this.isLoading = true;
    this.schedules = [];
    this.dailyScheduleService.getScheduleByDate(this.selectedDate).subscribe({
      next: (schedule) => {
        if (schedule) {
          schedule.therapies.sort((a, b) => 
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
          this.schedules = [schedule];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Fehler beim Laden des Tagesplans:', error);
        this.isLoading = false;
      }
    });
  }

  onDateChange(event: any): void {
    if (event.value) {
      this.selectedDate = event.value.toDate();
      this.loadDailySchedule();
    }
  }

  formatTime(date: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  formatTimeForPrint(date: string | Date): string {
    return this.formatTime(date);
  }

  printSchedule(): void {
    if (!this.schedules[0]?.therapies.length) {
      return;
    }

    const printWindow = window.open('', '_blank') as Window | null;
    if (!printWindow) {
      alert('Bitte erlaube Pop-ups für diese Seite');
      return;
    }

    const therapies = this.schedules[0].therapies;
    const formattedDate = dayjs(this.selectedDate).format('DD.MM.YYYY');
    const formatTime = this.formatTimeForPrint.bind(this);
    
    const printContent = `
      <html>
        <head>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 30px;
              font-size: 14px;
              position: relative;
              min-height: 100vh;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 30px;
              border-bottom: 3px solid #000;
              padding-bottom: 15px;
            }
            .header-left {
              display: flex;
              align-items: center;
            }
            .logo-container {
              text-align: center;
              margin-right: 30px;
            }
            .logo {
              width: 180px;
              margin-bottom: 10px;
            }
            .logo-text {
              font-size: 16px;
              font-weight: bold;
              line-height: 1.3;
            }
            .title {
              font-size: 36px;
              font-weight: bold;
            }
            .header-right {
              text-align: right;
              font-size: 24px;
              font-weight: bold;
              margin-top: 20px;
            }
            .footer {
              position: fixed;
              bottom: 0;
              left: 0;
              width: 100%;
              text-align: center;
              padding: 20px 0;
            }
            .footer-logo {
              width: 120px;
              opacity: 0.7;
            }
            .content {
              margin-bottom: 160px; /* Platz für Footer */
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              table-layout: fixed;
              border: 2px solid #000;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 8px 10px; 
              text-align: left;
              vertical-align: top;
              word-wrap: break-word;
            }
            th { 
              background-color: #f5f5f5;
              font-weight: bold;
              font-size: 16px;
              border-bottom: 2px solid #000;
            }
            td {
              font-size: 14px;
              line-height: 1.4;
            }
            th:nth-child(1) { width: 10%; } /* Zeit */
            th:nth-child(2) { width: 18%; } /* Programm */
            th:nth-child(3) { width: 15%; } /* Mitarbeiter */
            th:nth-child(4) { width: 22%; } /* Bewohner */
            th:nth-child(5) { width: 12%; } /* Ort */
            th:nth-child(6) { width: 8%; }  /* Vorbereitung */
            th:nth-child(7) { width: 8%; }  /* Nachbereitung */
            th:nth-child(8) { width: 12%; } /* Kommentare */
            .patients-cell div { 
              margin-bottom: 6px;
              line-height: 1.4;
            }
            @media print {
              @page { 
                size: A4 landscape;
                margin: 2cm;
              }
              body { 
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              th { 
                background-color: #f5f5f5 !important;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
            }
          </style>
        </head>
        <body>
          <div class="content">
            <div class="header">
              <div class="header-left">
                <div class="logo-container">
                  <img src="/assets/images/schloss.jpg" alt="Schloss" class="logo">
                  <div class="logo-text">
                    Schloss Binau<br>
                    Private Pflege
                  </div>
                </div>
                <div class="title">Tagesplan</div>
              </div>
              <div class="header-right">${formattedDate}</div>
            </div>

            <table>
              <thead>
                <tr>
                  <th>Zeit</th>
                  <th>Programm</th>
                  <th>Mitarbeiter</th>
                  <th>Bewohner</th>
                  <th>Ort</th>
                  <th>Vorbereitung</th>
                  <th>Nachbereitung</th>
                  <th>Kommentare</th>
                </tr>
              </thead>
              <tbody>
                ${therapies.map(therapy => `
                  <tr>
                    <td>${formatTime(therapy.startTime)} - ${formatTime(therapy.endTime)}</td>
                    <td>${therapy.name}</td>
                    <td>${therapy.leadingEmployee?.name} ${therapy.leadingEmployee?.surname}</td>
                    <td class="patients-cell">
                      ${therapy.patients.map(patient => 
                        `<div>${patient.name} ${patient.surname}</div>`
                      ).join('')}
                    </td>
                    <td>${therapy.location?.name || ''}</td>
                    <td>${therapy.preparationTime ? therapy.preparationTime + ' Min.' : ''}</td>
                    <td>${therapy.followUpTime ? therapy.followUpTime + ' Min.' : ''}</td>
                    <td>${therapy.comment || ''}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
          <div class="footer">
            <img src="/assets/images/schloss.jpg" alt="Schloss" class="footer-logo">
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
    
    // Warte auf das Laden der Styles
    setTimeout(() => {
      printWindow.print();
    }, 250);
  }

  openTherapyDetails(therapy: Therapy): void {
    import('../daily-schedule-detail-dialog/daily-schedule-detail-dialog.component')
      .then(m => m.DailyScheduleDetailDialogComponent)
      .then(component => {
        this.dialog.open(component, {
          data: therapy,
          width: '600px'
        });
      });
  }

  duplicateSchedule(): void {
    const dialogRef = this.dialog.open(DuplicateScheduleDialogComponent, {
      width: '400px'
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        console.log('Selected date for duplication:', result);
        const currentSchedule = this.schedules[0];
        
        if (!currentSchedule || !currentSchedule.therapies.length) {
          console.error('Kein Tagesplan zum Duplizieren vorhanden');
          return;
        }

        // Zuerst alle Therapien erstellen
        const therapyRequests = currentSchedule.therapies.map(therapy => {
          const oldDate = new Date(this.selectedDate);
          const newDate = new Date(result);
          oldDate.setHours(0, 0, 0, 0);
          newDate.setHours(0, 0, 0, 0);
          const daysDiff = newDate.getTime() - oldDate.getTime();
          
          const newTherapy: Therapy = {
            ...therapy,
            id: undefined,
            startTime: new Date(new Date(therapy.startTime).getTime() + daysDiff),
            endTime: new Date(new Date(therapy.endTime).getTime() + daysDiff)
          };
          
          return this.therapyService.createTherapy(newTherapy);
        });

        // Warte auf alle Therapie-Erstellungen
        forkJoin(therapyRequests).subscribe({
          next: (newTherapies) => {
            // Erstelle den Tagesplan mit den neuen Therapien
            const duplicatedSchedule: DailySchedule = {
              date: result,
              therapies: newTherapies
            };

            this.dailyScheduleService.addSchedule(duplicatedSchedule).subscribe({
              next: (newSchedule) => {
                console.log('Successfully duplicated schedule:', newSchedule);
                this.selectedDate = new Date(result);
                this.loadDailySchedule();
              },
              error: (error) => {
                console.error('Fehler beim Duplizieren des Tagesplans:', error);
                alert('Fehler beim Duplizieren des Tagesplans');
              }
            });
          },
          error: (error) => {
            console.error('Fehler beim Erstellen der Therapien:', error);
            alert('Fehler beim Erstellen der Therapien');
          }
        });
      }
    });
  }

  duplicateTherapy(therapy: Therapy): void {
    const dialogRef = this.dialog.open(DuplicateTherapyDialogComponent, {
      width: '400px',
      data: { therapy }
    });

    dialogRef.afterClosed().subscribe(targetDate => {
      if (targetDate) {
        console.log('Target date for duplication:', targetDate);
        
        const duplicatedTherapy: Therapy = {
          ...therapy,
          id: undefined,
          startTime: new Date(therapy.startTime),
          endTime: new Date(therapy.endTime),
          location: { ...therapy.location },
          leadingEmployee: { ...therapy.leadingEmployee },
          patients: therapy.patients.map(p => ({ ...p }))
        };

        const startDate = new Date(duplicatedTherapy.startTime);
        const endDate = new Date(duplicatedTherapy.endTime);
        
        const target = dayjs(targetDate).startOf('day');
        const startTime = dayjs(startDate).format('HH:mm:ss');
        const endTime = dayjs(endDate).format('HH:mm:ss');
        
        duplicatedTherapy.startTime = dayjs(target.format('YYYY-MM-DD') + ' ' + startTime).toDate();
        duplicatedTherapy.endTime = dayjs(target.format('YYYY-MM-DD') + ' ' + endTime).toDate();

        this.dailyScheduleService.createTherapy(duplicatedTherapy).subscribe({
          next: (newTherapy) => {
            console.log('Therapy duplicated successfully:', newTherapy);
            const targetDateStr = dayjs(targetDate).format('YYYY-MM-DD');
            const currentDateStr = dayjs(this.selectedDate).format('YYYY-MM-DD');
            if (targetDateStr === currentDateStr) {
              this.loadDailySchedule();
            }
          },
          error: (error) => {
            console.error('Error duplicating therapy:', error);
            alert('Fehler beim Duplizieren der Therapie');
          }
        });
      }
    });
  }

  editTherapy(therapy: Therapy): void {
    const dialogRef = this.dialog.open(EditTherapyDialogComponent, {
      width: '600px',
      data: { 
        therapy: {
          ...therapy,
          location: { ...therapy.location },
          leadingEmployee: { ...therapy.leadingEmployee },
          patients: therapy.patients.map(p => ({ ...p }))
        }
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dailyScheduleService.updateTherapy(result).subscribe({
          next: () => {
            console.log('Therapy updated successfully');
            this.loadDailySchedule();
          },
          error: (error) => {
            console.error('Error updating therapy:', error);
            alert('Fehler beim Aktualisieren der Therapie');
          }
        });
      }
    });
  }

  deleteTherapy(therapy: Therapy): void {
    if (confirm(`Möchten Sie die Therapie "${therapy.name}" wirklich löschen?`)) {
      this.dailyScheduleService.deleteTherapy(therapy.id!.toString()).subscribe({
        next: () => {
          console.log('Therapy deleted successfully');
          this.loadDailySchedule();
        },
        error: (error) => {
          console.error('Error deleting therapy:', error);
          alert('Fehler beim Löschen der Therapie');
        }
      });
    }
  }
}
