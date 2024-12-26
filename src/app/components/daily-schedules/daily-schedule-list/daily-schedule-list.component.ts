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
import moment from 'moment';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { FormsModule } from '@angular/forms';

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
          dateInput: 'L',
        },
        display: {
          dateInput: 'L',
          monthYearLabel: 'MMM YYYY',
          dateA11yLabel: 'LL',
          monthYearA11yLabel: 'MMMM YYYY',
        },
      },
    }
  ]
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
    private router: Router
  ) {}

  ngOnInit(): void {
    moment.locale('de');
    this.loadDailySchedule();
  }

  loadDailySchedule(): void {
    this.isLoading = true;
    this.schedules = [];
    this.dailyScheduleService.getScheduleByDate(this.selectedDate).subscribe({
      next: (schedule) => {
        if (schedule) {
          // Sortiere Therapien nach Startzeit
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
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleTimeString('de-DE', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('de-DE', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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

  private formatTimeForPrint(time: string | Date): string {
    return moment(time).format('HH:mm');
  }

  printSchedule(): void {
    if (!this.schedules[0]?.therapies.length) {
      return;
    }

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      alert('Bitte erlaube Pop-ups für diese Seite');
      return;
    }

    const therapies = this.schedules[0].therapies;
    const formattedDate = moment(this.selectedDate).format('DD.MM.YYYY');
    const formatTime = this.formatTimeForPrint.bind(this);
    
    const printContent = `
      <html>
        <head>
          <style>
            body {
              font-family: Arial, sans-serif;
              margin: 20px;
              font-size: 12px;
            }
            .header {
              display: flex;
              justify-content: space-between;
              align-items: flex-start;
              margin-bottom: 20px;
              border-bottom: 2px solid #000;
              padding-bottom: 10px;
            }
            .header-left {
              display: flex;
              align-items: center;
            }
            .logo {
              width: 180px;
              margin-right: 20px;
            }
            .title {
              font-size: 24px;
              font-weight: bold;
            }
            .header-right {
              text-align: right;
              font-size: 16px;
              font-weight: bold;
            }
            table { 
              width: 100%; 
              border-collapse: collapse; 
              margin-top: 20px;
              table-layout: fixed;
            }
            th, td { 
              border: 1px solid #000; 
              padding: 6px; 
              text-align: left;
              vertical-align: top;
              word-wrap: break-word;
            }
            th { 
              background-color: #f5f5f5;
              font-weight: bold;
              border-bottom: 2px solid #000;
            }
            th:nth-child(1) { width: 12%; } /* Zeit */
            th:nth-child(2) { width: 15%; } /* Name */
            th:nth-child(3) { width: 12%; } /* Mitarbeiter */
            th:nth-child(4) { width: 20%; } /* Bewohner */
            th:nth-child(5) { width: 12%; } /* Ort */
            th:nth-child(6) { width: 8%; }  /* Vorbereitung */
            th:nth-child(7) { width: 8%; }  /* Nachbereitung */
            th:nth-child(8) { width: 13%; } /* Kommentare */
            .patients-cell div { 
              margin-bottom: 4px;
              line-height: 1.2;
            }
            @media print {
              @page { 
                size: A4 landscape;
                margin: 1.5cm;
              }
              body { 
                margin: 0;
                -webkit-print-color-adjust: exact;
                print-color-adjust: exact;
              }
              th { 
                background-color: #f5f5f5 !important;
              }
              td {
                padding: 4px 6px;
              }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="header-left">
              <img src="/assets/images/schloss.jpg" alt="Schloss" class="logo">
              <div class="title">Tagesplan</div>
            </div>
            <div class="header-right">${formattedDate}</div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Zeit</th>
                <th>Name</th>
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

        // Erstelle eine tiefe Kopie des aktuellen Tagesplans
        const duplicatedSchedule: DailySchedule = {
          date: result,
          therapies: currentSchedule.therapies.map(therapy => {
            // Berechne Zeitdifferenz zwischen altem und neuem Datum in Millisekunden
            const oldDate = new Date(this.selectedDate);
            const newDate = new Date(result);
            oldDate.setHours(0, 0, 0, 0);
            newDate.setHours(0, 0, 0, 0);
            const daysDiff = newDate.getTime() - oldDate.getTime();
            
            // Kopiere die Therapie und passe die Zeiten an
            const newTherapy: Therapy = {
              ...therapy,
              id: undefined, // ID entfernen, damit eine neue generiert wird
              startTime: new Date(new Date(therapy.startTime).getTime() + daysDiff),
              endTime: new Date(new Date(therapy.endTime).getTime() + daysDiff)
            };
            
            console.log('Duplicated therapy:', {
              original: {
                name: therapy.name,
                startTime: therapy.startTime,
                endTime: therapy.endTime
              },
              new: {
                name: newTherapy.name,
                startTime: newTherapy.startTime,
                endTime: newTherapy.endTime
              }
            });
            
            return newTherapy;
          })
        };

        console.log('Duplicated schedule:', duplicatedSchedule);

        // Speichere den duplizierten Tagesplan
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
      }
    });
  }

  duplicateTherapy(therapy: Therapy): void {
    console.log('Duplicating therapy:', therapy);
    const dialogRef = this.dialog.open(DuplicateTherapyDialogComponent, {
      width: '400px',
      data: { therapy }
    });

    dialogRef.afterClosed().subscribe(targetDate => {
      if (targetDate) {
        console.log('Target date for duplication:', targetDate);
        
        // Create a deep copy of the therapy
        const duplicatedTherapy: Therapy = {
          ...therapy,
          id: undefined, // Remove ID so a new one will be generated
          startTime: new Date(therapy.startTime),
          endTime: new Date(therapy.endTime),
          location: { ...therapy.location },
          leadingEmployee: { ...therapy.leadingEmployee },
          patients: therapy.patients.map(p => ({ ...p }))
        };

        // Update the date while keeping the same time
        const startDate = new Date(duplicatedTherapy.startTime);
        const endDate = new Date(duplicatedTherapy.endTime);
        
        // Set the new date while preserving the time
        const target = moment(targetDate).startOf('day');
        const startTime = moment(startDate).format('HH:mm:ss');
        const endTime = moment(endDate).format('HH:mm:ss');
        
        duplicatedTherapy.startTime = moment(target.format('YYYY-MM-DD') + ' ' + startTime).toDate();
        duplicatedTherapy.endTime = moment(target.format('YYYY-MM-DD') + ' ' + endTime).toDate();

        console.log('Duplicated therapy with new dates:', duplicatedTherapy);

        // Save the duplicated therapy
        this.dailyScheduleService.createTherapy(duplicatedTherapy).subscribe({
          next: (newTherapy) => {
            console.log('Therapy duplicated successfully:', newTherapy);
            // Refresh the list if the target date is the currently displayed date
            const targetDateStr = moment(targetDate).format('YYYY-MM-DD');
            const currentDateStr = moment(this.selectedDate).format('YYYY-MM-DD');
            if (targetDateStr === currentDateStr) {
              this.loadDailySchedule();
            }
          },
          error: (error) => {
            console.error('Error duplicating therapy:', error);
            // Show error message to user
          }
        });
      }
    });
  }

  editTherapy(therapy: Therapy): void {
    console.log('Editing therapy:', therapy);
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
      console.log('Dialog result:', result);
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
    console.log('Deleting therapy:', therapy);
    if (confirm(`Möchten Sie die Therapie "${therapy.name}" wirklich löschen?`)) {
      this.dailyScheduleService.deleteTherapy(therapy.id!).subscribe({
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
