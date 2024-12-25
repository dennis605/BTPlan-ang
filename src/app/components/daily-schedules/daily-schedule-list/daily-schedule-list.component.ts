import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Therapy } from '../../../models/therapy';
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
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { FormsModule } from '@angular/forms';
import { DailySchedule } from '../../../models/daily-schedule';
import { DailyScheduleService } from '../../../services/daily-schedule.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-daily-schedule-list',
  templateUrl: './daily-schedule-list.component.html',
  styleUrls: ['./daily-schedule-list.component.scss'],
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
    MatProgressSpinnerModule
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
  // Spalten für die Tabelle
  displayedColumns: string[] = [
    'time',
    'name',
    'leadingEmployee',
    'patients',
    'location',
    'preparationTime',
    'followUpTime',
    'comment',
    'therapyType'
  ];

  constructor(
    private dailyScheduleService: DailyScheduleService,
    private dialog: MatDialog,
    private router: Router
  ) {}

  ngOnInit(): void {
    moment.locale('de');
    this.loadSchedule();
  }

  loadSchedule(): void {
    this.isLoading = true;
    this.dailyScheduleService.getScheduleByDate(this.selectedDate).subscribe({
      next: (schedule) => {
        if (schedule) {
          // Sortiere Therapien nach Startzeit
          schedule.therapies.sort((a, b) => 
            new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
          );
          this.schedules = [schedule];
        } else {
          this.schedules = [];
        }
      },
      error: (error) => {
        console.error('Fehler beim Laden des Tagesplans:', error);
        alert('Fehler beim Laden des Tagesplans');
        this.schedules = [];
      },
      complete: () => {
        this.isLoading = false;
      }
    });
  }

  onDateChange(event: any): void {
    if (event && event.value) {
      this.selectedDate = event.value.toDate();
      this.schedules = []; // Liste leeren
      this.loadSchedule(); // Neue Daten laden
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
      <!DOCTYPE html>
      <html>
      <head>
        <title>Tagesplan ${formattedDate}</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            margin: 20px;
            font-size: 12px;
          }
          h1 { 
            text-align: center; 
            margin-bottom: 10px;
            font-size: 24px;
          }
          .date { 
            text-align: center; 
            margin-bottom: 30px; 
            color: #666;
            font-size: 16px;
          }
          table { 
            width: 100%; 
            border-collapse: collapse; 
            margin-top: 20px;
            table-layout: fixed;
          }
          th, td { 
            border: 1px solid #ddd; 
            padding: 6px; 
            text-align: left;
            vertical-align: top;
            word-wrap: break-word;
          }
          th { 
            background-color: #f5f5f5;
            font-weight: bold;
          }
          th:nth-child(1) { width: 15%; } /* Zeit */
          th:nth-child(2) { width: 15%; } /* Name */
          th:nth-child(3) { width: 12%; } /* Leitung */
          th:nth-child(4) { width: 20%; } /* Teilnehmer */
          th:nth-child(5) { width: 12%; } /* Ort */
          th:nth-child(6) { width: 8%; }  /* Vorbereitung */
          th:nth-child(7) { width: 8%; }  /* Nachbereitung */
          th:nth-child(8) { width: 10%; } /* Kommentare */
          .patients-cell div { 
            margin-bottom: 4px;
            line-height: 1.2;
          }
          @media print {
            @page { 
              size: A4 landscape;
              margin: 1cm;
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
        <h1>Tagesplan</h1>
        <div class="date">${formattedDate}</div>
        <table>
          <thead>
            <tr>
              <th>Zeit</th>
              <th>Name</th>
              <th>Leitung</th>
              <th>Teilnehmer</th>
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
                <td>${therapy.location?.name}</td>
                <td>${therapy.preparationTime} Min.</td>
                <td>${therapy.followUpTime} Min.</td>
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
}
