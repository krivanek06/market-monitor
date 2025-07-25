import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export type InlineInputDialogComponentData = {
  title: string;
  description?: string;
  initialValue?: string;

  validatorMaxLength?: number;
  validatorMinLength?: number;
};

@Component({
  selector: 'app-inline-input-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatInputModule, MatFormFieldModule, ReactiveFormsModule, MatButtonModule],
  template: `
    <div class="p-4">
      <div class="text-wt-primary mb-3 text-center text-lg">{{ data.title }}</div>
      <div *ngIf="data.description" class="text-wt-gray-medium mb-3 text-center text-sm">{{ data.description }}</div>

      <!-- input -->
      <form [formGroup]="inputValueForm">
        <mat-form-field class="w-full">
          <mat-label>Enter Value</mat-label>
          <input matInput [formControl]="inputValueForm.controls.value" (keydown.space)="$event.preventDefault()" />
        </mat-form-field>

        <!-- error messages -->
        @if (inputValueForm.touched && inputValueForm.invalid) {
          <div class="-mt-5 px-2">
            @if (inputValueForm.controls.value.hasError('required')) {
              <mat-error>Value is required</mat-error>
            }
            @if (inputValueForm.controls.value.hasError('minlength')) {
              <mat-error>Value must be at least 4 characters long</mat-error>
            }
            @if (inputValueForm.controls.value.hasError('maxlength')) {
              <mat-error>Value must be at most {{ data.validatorMaxLength ?? 30 }} characters long</mat-error>
            }
          </div>
        }
      </form>

      <!-- action buttons -->
      <div class="mt-6 flex flex-col-reverse gap-4 md:flex-row">
        <button mat-flat-button class="w-full" (click)="cancel()" type="button">Cancel</button>
        <button
          mat-flat-button
          class="w-full"
          color="primary"
          type="button"
          (click)="confirm()"
          [disabled]="inputValueForm.invalid"
        >
          Confirm
        </button>
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
  private readonly dialogRef = inject(MatDialogRef<InlineInputDialogComponent, InlineInputDialogComponentData>);
  readonly data = inject<InlineInputDialogComponentData>(MAT_DIALOG_DATA);

  readonly inputValueForm = new FormGroup({
    value: new FormControl<string>('', {
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(30)],
    }),
  });

  constructor() {
    // set initial value
    if (this.data.initialValue) {
      this.inputValueForm.controls.value.patchValue(this.data.initialValue, { emitEvent: false });
    }

    // keep original validators and add maxLength validator
    const minLength = this.data.validatorMinLength ?? 0;
    const maxLength = this.data.validatorMaxLength ?? 100;
    this.inputValueForm.controls.value.setValidators([
      Validators.required,
      Validators.minLength(minLength),
      Validators.maxLength(maxLength),
    ]);
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }

  confirm(): void {
    if (!this.inputValueForm.valid) {
      return;
    }

    // remove white spaces
    const result = this.inputValueForm.controls.value.value?.trim();
    this.dialogRef.close(result);
  }
}
