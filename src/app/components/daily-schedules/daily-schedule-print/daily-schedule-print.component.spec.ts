import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DailySchedulePrintComponent } from './daily-schedule-print.component';

describe('DailySchedulePrintComponent', () => {
  let component: DailySchedulePrintComponent;
  let fixture: ComponentFixture<DailySchedulePrintComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DailySchedulePrintComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(DailySchedulePrintComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
