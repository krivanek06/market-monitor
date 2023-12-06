import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

export type ActionButtonDialog = {
  dialogTitle: string;

  primaryButtonText: string;
  primaryButtonColor?: 'primary' | 'accent' | 'warn';

  secondaryButtonText?: string;
  secondaryButtonColor?: 'primary' | 'accent' | 'warn';
};

@Component({
  selector: 'app-action-button-dialog',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatIconModule, MatDialogModule],
  templateUrl: './action-button-dialog.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ActionButtonDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<ActionButtonDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ActionButtonDialog,
  ) {}

  onPrimaryClick(): void {
    this.dialogRef.close('primary');
  }

  onSecondaryClick(): void {
    this.dialogRef.close('secondary');
  }

  close(): void {
    this.dialogRef.close();
  }
}
