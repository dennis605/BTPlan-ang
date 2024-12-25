import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StatisticsDetailDialogComponent } from './statistics-detail-dialog.component';

describe('StatisticsDetailDialogComponent', () => {
  let component: StatisticsDetailDialogComponent;
  let fixture: ComponentFixture<StatisticsDetailDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatisticsDetailDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StatisticsDetailDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
