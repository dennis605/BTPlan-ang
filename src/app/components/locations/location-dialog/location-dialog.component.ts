import { Component, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Location } from '../../../models/location';
import { MaterialModule } from '../../../material/material.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-location-dialog',
  templateUrl: './location-dialog.component.html',
  styleUrls: ['./location-dialog.component.scss'],
  standalone: true,
  imports: [MaterialModule, ReactiveFormsModule, CommonModule]
})
export class LocationDialogComponent {
  locationForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<LocationDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: Location
  ) {
    this.locationForm = this.fb.group({
      id: [data?.id || null],
      name: [data?.name || '', [Validators.required]],
      description: [data?.description || '']
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
