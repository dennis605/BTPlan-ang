import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyScheduleDetailDialogComponent } from './daily-schedule-detail-dialog.component';

describe('DailyScheduleDetailDialogComponent', () => {
  let component: DailyScheduleDetailDialogComponent;
  let fixture: ComponentFixture<DailyScheduleDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyScheduleDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyScheduleDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
