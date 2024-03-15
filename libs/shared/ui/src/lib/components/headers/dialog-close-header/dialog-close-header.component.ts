import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Optional, SkipSelf, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialog-close-header',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatButtonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between p-4">
      <h2 class="text-xl text-wt-primary mb-0">{{ title() }}</h2>

      <div *ngIf="showCloseButton()">
        <button mat-icon-button color="warn" type="button" (click)="onDialogClose()">
          <mat-icon>close</mat-icon>
        </button>
      </div>
    </div>
  `,
})
export class DialogCloseHeaderComponent {
  dialogCloseEmitter = output<void>();
  title = input.required<string>();
  showCloseButton = input(true);

  constructor(@Optional() @SkipSelf() private dialogRef: MatDialogRef<unknown>) {}

  onDialogClose(): void {
    this.dialogCloseEmitter.emit();
    if (this.dialogRef) {
      console.log('Close');
      this.dialogRef.close();
    }
  }
}
