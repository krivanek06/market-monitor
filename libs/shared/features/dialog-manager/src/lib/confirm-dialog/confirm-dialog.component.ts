import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-confirm-dialog',
  template: `
    <div class="max-w-xl p-4 text-center sm:min-w-[400px]">
      <p class="text-xl">{{ data.dialogTitle }}</p>
      <div class="flex flex-col-reverse gap-4 mt-6 md:flex-row">
        <button mat-button *ngIf="data.showCancelButton" class="w-full" (click)="cancel()" color="primary">
          Cancel
        </button>
        <button mat-flat-button class="w-full" color="primary" (click)="confirm()">{{ data.confirmButton }}</button>
      </div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatDialogModule],
})
export class ConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dialogTitle: string; showCancelButton: boolean; confirmButton: string },
  ) {}

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
