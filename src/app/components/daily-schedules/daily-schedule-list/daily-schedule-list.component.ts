import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Therapy } from '../../../models/therapy';
import { DailySchedule } from '../../../models/daily-schedule';
import { DailyScheduleService } from '../../../services/daily-schedule.service';
import { DailyScheduleDetailDialogComponent } from '../daily-schedule-detail-dialog/daily-schedule-detail-dialog.component';
import { EditTherapyDialogComponent } from '../edit-therapy-dialog/edit-therapy-dialog.component';
import { DuplicateScheduleDialogComponent } from '../duplicate-schedule-dialog/duplicate-schedule-dialog.component';
import { DuplicateTherapyDialogComponent } from '../duplicate-therapy-dialog/duplicate-therapy-dialog.component';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { DateAdapter, MAT_DATE_LOCALE, MAT_DATE_FORMATS } from '@angular/material/core';
import { MomentDateAdapter, MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular/material-moment-adapter';
import dayjs from 'dayjs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';
import { map } from 'rxjs/operators';

@Component({
  selector: 'app-daily-schedule-list',
  templateUrl: './daily-schedule-list.component.html',
  styles: [`
    .daily-schedule-container {
      padding: 20px;
    }

    .daily-schedule-container h2 {
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

    .therapy-row:hover {
      background-color: rgba(0, 0, 0, 0.04);
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
  `],
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
  ]
})
export class DailyScheduleListComponent implements OnInit {
  schedules: DailySchedule[] = [];
  selectedDate: string = dayjs().startOf('day').toISOString();
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
    private router: Router
  ) {}

  ngOnInit(): void {
    dayjs.locale('de');
    this.loadDailySchedule();
  }

  loadDailySchedule(): void {
    this.isLoading = true;
    this.schedules = [];
    this.dailyScheduleService.getDailySchedules().pipe(
      map((schedules: DailySchedule[]) => schedules.find(s => 
        dayjs(s.date).format('YYYY-MM-DD') === dayjs(this.selectedDate).format('YYYY-MM-DD')
      ))
    ).subscribe({
      next: (schedule) => {
        if (schedule) {
          // Sortiere Therapien nach Startzeit
          const sortedTherapies = [...schedule.therapies].sort((a, b) => 
            dayjs(a.startTime).valueOf() - dayjs(b.startTime).valueOf()
          );
          this.schedules = [{
            ...schedule,
            therapies: sortedTherapies
          }];
        }
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Fehler beim Laden des Tagesplans:', error);
        this.isLoading = false;
      }
    });
  }

  onDateChange(event: { value: { toDate: () => Date } }): void {
    if (event.value) {
      this.selectedDate = dayjs(event.value.toDate()).startOf('day').toISOString();
      this.loadDailySchedule();
    }
  }

  formatTime(date: string): string {
    if (!date) return '';
    return dayjs(date).format('HH:mm');
  }

  formatTimeForPrint(date: string): string {
    return this.formatTime(date);
  }

  formatDate(date: string): string {
    return dayjs(date).format('dddd, D. MMMM YYYY');
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
        const currentSchedule = this.schedules[0];
        if (!currentSchedule || !currentSchedule.therapies.length) {
          console.error('Kein Tagesplan zum Duplizieren vorhanden');
          return;
        }

        const duplicatedSchedule: DailySchedule = {
          id: crypto.randomUUID(),
          date: dayjs(result).toISOString(),
          therapies: currentSchedule.therapies.map(therapy => {
            const oldDate = dayjs(this.selectedDate).startOf('day');
            const newDate = dayjs(result).startOf('day');
            const daysDiff = newDate.diff(oldDate, 'millisecond');
            
            return {
              ...therapy,
              id: crypto.randomUUID(),
              startTime: dayjs(therapy.startTime).add(daysDiff, 'millisecond').toISOString(),
              endTime: dayjs(therapy.endTime).add(daysDiff, 'millisecond').toISOString()
            };
          })
        };

        this.dailyScheduleService.addDailySchedule(duplicatedSchedule).subscribe({
          next: () => {
            this.selectedDate = dayjs(result).toISOString();
            this.loadDailySchedule();
          },
          error: (error) => {
            console.error('Fehler beim Duplizieren des Tagesplans:', error);
            alert('Fehler beim Duplizieren des Tagesplans');
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
        const duplicatedTherapy: Therapy = {
          ...therapy,
          id: crypto.randomUUID(),
          startTime: dayjs(therapy.startTime)
            .year(dayjs(targetDate).year())
            .month(dayjs(targetDate).month())
            .date(dayjs(targetDate).date())
            .toISOString(),
          endTime: dayjs(therapy.endTime)
            .year(dayjs(targetDate).year())
            .month(dayjs(targetDate).month())
            .date(dayjs(targetDate).date())
            .toISOString()
        };

        const newSchedule: DailySchedule = {
          id: crypto.randomUUID(),
          date: dayjs(targetDate).startOf('day').toISOString(),
          therapies: [duplicatedTherapy]
        };

        this.dailyScheduleService.addDailySchedule(newSchedule).subscribe({
          next: () => {
            if (dayjs(targetDate).format('YYYY-MM-DD') === dayjs(this.selectedDate).format('YYYY-MM-DD')) {
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
      data: { therapy }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const currentSchedule = this.schedules[0];
        if (!currentSchedule) return;

        const updatedSchedule: DailySchedule = {
          ...currentSchedule,
          therapies: currentSchedule.therapies.map(t => 
            t.id === result.id ? result : t
          )
        };

        this.dailyScheduleService.updateDailySchedule(updatedSchedule).subscribe({
          next: () => {
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
      const currentSchedule = this.schedules[0];
      if (!currentSchedule) return;

      const updatedSchedule: DailySchedule = {
        ...currentSchedule,
        therapies: currentSchedule.therapies.filter(t => t.id !== therapy.id)
      };

      this.dailyScheduleService.updateDailySchedule(updatedSchedule).subscribe({
        next: () => {
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
