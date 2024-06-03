import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

export type ConfirmDialogComponentData = {
  dialogTitle: string;
  showCancelButton: boolean;
  confirmButton: string;
  showTextWord?: string;
};

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="max-w-xl p-4 text-center sm:min-w-[400px]">
      <p class="whitespace-pre-line text-xl">{{ data.dialogTitle }}</p>

      <!-- input text if exists -->
      <mat-form-field *ngIf="data.showTextWord" class="mt-5 w-full">
        <mat-label>Place required text: {{ data.showTextWord }}</mat-label>
        <input matInput [placeholder]="data.showTextWord" [formControl]="userInputControl" />
      </mat-form-field>

      <!-- action button -->
      <div class="mt-6 flex flex-col-reverse gap-4 md:flex-row">
        <button mat-button *ngIf="data.showCancelButton" class="w-full" (click)="cancel()" color="primary">
          Cancel
        </button>
        <button mat-flat-button class="w-full" color="primary" (click)="confirm()" [disabled]="!enableConfirmButton">
          {{ data.confirmButton }}
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
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule],
})
export class ConfirmDialogComponent {
  userInputControl = new FormControl('');

  get enableConfirmButton(): boolean {
    if (!this.data.showTextWord) {
      return true;
    }
    return this.userInputControl.value === this.data.showTextWord;
  }

  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogComponentData,
  ) {}

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
