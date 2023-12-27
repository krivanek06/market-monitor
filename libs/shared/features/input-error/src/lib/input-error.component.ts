import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ErrorMessagePipe } from './error-message.pipe';

/**
 * Simple component to display the error messages of a form control
 */
@Component({
  selector: 'app-input-error',
  standalone: true,
  imports: [CommonModule, ErrorMessagePipe, MatFormFieldModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @for (error of errors | keyvalue; track error.key) {
      <mat-error class="pl-3 mb-2">
        {{ error.key | errorMessage: error.value }}
      </mat-error>
    }
  `,
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
})
export class InputErrorComponent {
  @Input({ required: true }) errors: ValidationErrors | undefined | null = null;
}
