import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-dialog-close-header',
  standalone: true,
  imports: [MatIconModule, MatButtonModule, MatDialogModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="flex items-center justify-between p-4">
      <h2 class="text-wt-primary mb-0 text-xl">{{ title() }}</h2>

      @if (showCloseButton()) {
        <div>
          <button mat-icon-button color="warn" type="button" (click)="onDialogClose()">
            <mat-icon>close</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
})
export class DialogCloseHeaderComponent {
  private dialogRef = inject(MatDialogRef<unknown>, {
    optional: true,
    skipSelf: true,
  });
  readonly dialogCloseEmitter = output<void>();
  readonly title = input.required<string>();
  readonly showCloseButton = input(true);

  onDialogClose(): void {
    this.dialogCloseEmitter.emit();
    if (this.dialogRef) {
      this.dialogRef.close();
    }
  }
}
