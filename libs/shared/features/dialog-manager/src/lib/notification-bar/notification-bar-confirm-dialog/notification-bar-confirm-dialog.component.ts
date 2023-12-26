import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-notification-bar-confirm-dialog',
  template: `
    <div class="p-4 max-w-xl min-w-[300px]">
      <p class="text-base text-center">{{ data.dialogTitle }}</p>
      <div class="flex flex-col-reverse gap-4 mt-6 md:flex-row">
        <button mat-stroked-button *ngIf="data.showCancelButton" class="w-full" (click)="cancel()">Cancel</button>
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
  imports: [CommonModule, MatButtonModule],
})
export class NotificationBarConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<NotificationBarConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dialogTitle: string; showCancelButton: boolean; confirmButton: string },
  ) {}

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
