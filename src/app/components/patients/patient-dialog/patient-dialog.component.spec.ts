import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PatientDialogComponent } from './patient-dialog.component';

describe('PatientDialogComponent', () => {
  let component: PatientDialogComponent;
  let fixture: ComponentFixture<PatientDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PatientDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PatientDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
