import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
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
      @if (data.showTextWord) {
        <mat-form-field class="mt-5 w-full">
          <mat-label>Place required text: {{ data.showTextWord }}</mat-label>
          <input matInput [placeholder]="data.showTextWord" [formControl]="userInputControl" />
        </mat-form-field>
      }

      <!-- action button -->
      <div class="mt-6 flex flex-col-reverse gap-4 md:flex-row">
        <!-- cancel -->
        @if (data.showCancelButton) {
          <button mat-button class="w-full" (click)="cancel()" type="button" color="primary">Cancel</button>
        }

        <!-- confirm -->
        <button
          mat-flat-button
          class="w-full"
          color="primary"
          type="button"
          (click)="confirm()"
          [disabled]="!enableConfirmButton"
        >
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
  imports: [MatButtonModule, MatDialogModule, ReactiveFormsModule, MatInputModule, MatFormFieldModule],
})
export class ConfirmDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<ConfirmDialogComponent>);
  readonly data = inject<ConfirmDialogComponentData>(MAT_DIALOG_DATA);
  readonly userInputControl = new FormControl('');

  get enableConfirmButton(): boolean {
    if (!this.data.showTextWord) {
      return true;
    }
    return this.userInputControl.value === this.data.showTextWord;
  }

  confirm(): void {
    if (!this.enableConfirmButton) {
      return;
    }

    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
