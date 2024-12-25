import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { TherapyService } from '../../../services/therapy.service';
import { Therapy } from '../../../models/therapy.model';
import moment from 'moment';

@Component({
  selector: 'app-daily-schedule-print',
  templateUrl: './daily-schedule-print.component.html',
  styleUrls: ['./daily-schedule-print.component.scss']
})
export class DailySchedulePrintComponent implements OnInit {
  therapies: Therapy[] = [];
  selectedDate: string = '';

  constructor(
    private route: ActivatedRoute,
    private therapyService: TherapyService
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (params['date']) {
        this.selectedDate = params['date'];
        this.loadTherapies(this.selectedDate);
      }
    });
  }

  loadTherapies(date: string): void {
    this.therapyService.getTherapiesByDate(date).subscribe(
      (therapies) => {
        this.therapies = therapies.sort((a, b) => {
          return moment(a.startTime).diff(moment(b.startTime));
        });
      }
    );
  }

  formatTime(time: string | Date): string {
    return moment(time).format('HH:mm');
  }

  formatDate(date: string): string {
    return moment(date).format('DD.MM.YYYY');
  }
}
