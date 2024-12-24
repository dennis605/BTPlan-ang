import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TherapyListComponent } from './therapy-list.component';

describe('TherapyListComponent', () => {
  let component: TherapyListComponent;
  let fixture: ComponentFixture<TherapyListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TherapyListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TherapyListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
