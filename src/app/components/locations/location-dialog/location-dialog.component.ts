import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { Location } from '../../../models/location';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-location-dialog',
  template: `
    <h2 mat-dialog-title>{{data?.location ? 'Ort bearbeiten' : 'Neuer Ort'}}</h2>
    <form [formGroup]="locationForm" (ngSubmit)="onSubmit()">
      <mat-dialog-content>
        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Name</mat-label>
          <input matInput formControlName="name" required>
          <mat-error *ngIf="locationForm.get('name')?.hasError('required')">
            Name ist erforderlich
          </mat-error>
        </mat-form-field>

        <mat-form-field appearance="fill" class="full-width">
          <mat-label>Beschreibung</mat-label>
          <textarea matInput formControlName="description" rows="3"></textarea>
        </mat-form-field>
      </mat-dialog-content>

      <mat-dialog-actions align="end">
        <button mat-button type="button" (click)="onCancel()">Abbrechen</button>
        <button mat-raised-button color="primary" 
                type="submit"
                [disabled]="!locationForm.valid">
          Speichern
        </button>
      </mat-dialog-actions>
    </form>
  `,
  styles: [`
    .full-width {
      width: 100%;
      margin-bottom: 15px;
    }
    textarea {
      min-height: 100px;
    }
  `],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule
  ]
})
export class LocationDialogComponent {
  locationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LocationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { location?: Location }
  ) {
    this.locationForm = this.fb.group({
      id: [data?.location?.id || crypto.randomUUID()],
      name: [data?.location?.name || '', [Validators.required]],
      description: [data?.location?.description || '']
    });
  }

  onSubmit(): void {
    if (this.locationForm.valid) {
      this.dialogRef.close(this.locationForm.value);
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}
