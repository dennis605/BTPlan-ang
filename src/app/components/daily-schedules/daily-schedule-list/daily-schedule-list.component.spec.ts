import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailyScheduleListComponent } from './daily-schedule-list.component';

describe('DailyScheduleListComponent', () => {
  let component: DailyScheduleListComponent;
  let fixture: ComponentFixture<DailyScheduleListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailyScheduleListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailyScheduleListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
