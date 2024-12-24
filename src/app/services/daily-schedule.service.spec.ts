import { TestBed } from '@angular/core/testing';

import { DailyScheduleService } from './daily-schedule.service';

describe('DailyScheduleService', () => {
  let service: DailyScheduleService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DailyScheduleService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
