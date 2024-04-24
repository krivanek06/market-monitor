import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DynamicValidatorMessage } from '@mm/shared/input-error';

export type InlineInputDialogComponentData = {
  title: string;
  description?: string;
  initialValue?: string;
};

@Component({
  selector: 'app-inline-input-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatInputModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatButtonModule,
    DynamicValidatorMessage,
  ],
  template: `
    <div class="p-4">
      <div class="text-center text-wt-primary text-lg mb-3">{{ data.title }}</div>
      <div *ngIf="data.description" class="mb-3 text-wt-gray-medium text-sm text-center">{{ data.description }}</div>

      <!-- input -->
      <form [formGroup]="inputValueForm">
        <mat-form-field class="w-full">
          <mat-label>Enter Value</mat-label>
          <input matInput formControlName="value" />
        </mat-form-field>
      </form>

      <!-- action buttons -->
      <div class="flex flex-col-reverse gap-4 mt-6 md:flex-row">
        <button mat-flat-button class="w-full" (click)="cancel()">Cancel</button>
        <button mat-flat-button class="w-full" color="primary" (click)="confirm()" [disabled]="inputValueForm.invalid">
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
export class InlineInputDialogComponent implements OnInit {
  private dialogRef = inject(MatDialogRef<InlineInputDialogComponent>);
  data = inject<InlineInputDialogComponentData>(MAT_DIALOG_DATA);

  inputValueForm = new FormGroup({
    value: new FormControl<string>('', {
      validators: [Validators.required, Validators.minLength(4), Validators.maxLength(30)],
    }),
  });

  ngOnInit(): void {
    if (this.data.initialValue) {
      this.inputValueForm.controls.value.patchValue(this.data.initialValue, { emitEvent: false });
    }
  }

  cancel(): void {
    this.dialogRef.close(undefined);
  }

  confirm(): void {
    if (!this.inputValueForm.valid) {
      return;
    }

    this.dialogRef.close(this.inputValueForm.controls.value.value);
  }
}
