import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TherapyDialogComponent } from './therapy-dialog.component';

describe('TherapyDialogComponent', () => {
  let component: TherapyDialogComponent;
  let fixture: ComponentFixture<TherapyDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TherapyDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TherapyDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
