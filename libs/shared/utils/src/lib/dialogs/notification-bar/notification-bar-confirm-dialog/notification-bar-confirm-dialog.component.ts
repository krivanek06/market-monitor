import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-notification-bar-confirm-dialog',
  templateUrl: './notification-bar-confirm-dialog.component.html',
  styleUrls: ['./notification-bar-confirm-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule, MatButtonModule],
})
export class NotificationBarConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<NotificationBarConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { dialogTitle: string; showCancelButton: boolean; confirmButton: string }
  ) {}

  confirm(): void {
    this.dialogRef.close(true);
  }

  cancel(): void {
    this.dialogRef.close(false);
  }
}
