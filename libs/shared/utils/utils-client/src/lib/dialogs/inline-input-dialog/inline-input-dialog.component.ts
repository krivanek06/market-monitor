import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export type InlineInputDialogComponentData = {
  title: string;
  description?: string;
};

@Component({
  selector: 'app-inline-input-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule, MatButtonModule],
  template: `
    <div class="p-4">
      <div class="text-center text-wt-primary text-lg mb-3">{{ data.title }}</div>
      <div *ngIf="data.description" class="mb-3 text-wt-gray-medium text-sm text-center">{{ data.description }}</div>

      <!-- input -->
      <mat-form-field class="w-full">
        <mat-label>Enter Value</mat-label>
        <input matInput [formControl]="inputValueControl" />

        @if (inputValueControl.hasError('required')) {
          <mat-error>Field is <strong>required</strong></mat-error>
        }
        @if (inputValueControl.hasError('minlength')) {
          <mat-error>Min length is <strong>4</strong> characters</mat-error>
        }
        @if (inputValueControl.hasError('maxlength')) {
          <mat-error>Max length is <strong>30</strong> characters</mat-error>
        }
      </mat-form-field>

      <!-- action buttons -->
      <div class="flex flex-col-reverse gap-4 mt-6 md:flex-row">
        <button mat-flat-button class="w-full" (click)="cancel()">Cancel</button>
        <button mat-flat-button class="w-full" color="primary" (click)="confirm()">Confirm</button>
      </div>
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InlineInputDialogComponent {
  inputValueControl = new FormControl<string>('', {
    validators: [Validators.required, Validators.minLength(4), Validators.maxLength(30)],
  });

  constructor(
    private dialogRef: MatDialogRef<InlineInputDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: InlineInputDialogComponentData,
  ) {}

  cancel(): void {
    this.dialogRef.close(undefined);
  }

  confirm(): void {
    if (!this.inputValueControl.valid) {
      return;
    }

    this.dialogRef.close(this.inputValueControl.value);
  }
}
