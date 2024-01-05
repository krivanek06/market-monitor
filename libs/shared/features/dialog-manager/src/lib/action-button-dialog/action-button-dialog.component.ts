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
  template: `
    <div class="max-w-xl p-2 text-center sm:min-w-[400px]">
      <div class="flex justify-end mb-2">
        <button mat-icon-button (click)="close()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
      <div class="p-2">
        <p class="text-xl">{{ data.dialogTitle }}</p>
        <div class="flex flex-col-reverse gap-4 mt-6 md:flex-row">
          <!-- secondary -->
          <button
            *ngIf="data.secondaryButtonText"
            mat-flat-button
            class="w-full"
            [color]="data.secondaryButtonColor"
            (click)="onSecondaryClick()"
          >
            {{ data.secondaryButtonText }}
          </button>
          <!-- only as placeholder -->
          <div *ngIf="!data.secondaryButtonText" class="w-full"></div>

          <!-- primary -->
          <button
            mat-flat-button
            class="w-full"
            [color]="data.primaryButtonColor ?? 'primary'"
            (click)="onPrimaryClick()"
          >
            {{ data.primaryButtonText }}
          </button>
        </div>
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
