import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';

export const KeyboardComponentValues = [
  { label: 1, value: 1 },
  { label: 2, value: 2 },
  { label: 3, value: 3 },
  { label: 4, value: 4 },
  { label: 5, value: 5 },
  { label: 6, value: 6 },
  { label: 7, value: 7 },
  { label: 8, value: 8 },
  { label: 9, value: 9 },
  { label: '.', value: '.' },
  { label: 0, value: 0 },
  { label: '<-', value: 'back' },
] as const;

export type KeyboardComponentType = (typeof KeyboardComponentValues)[number];

@Component({
  selector: 'app-number-keyboard-control',
  standalone: true,
  imports: [CommonModule, MatButtonModule],
  template: `
    <div class="grid grid-cols-3 gap-2">
      <ng-container *ngFor="let button of KeyboardComponent">
        <button
          *ngIf="enableDecimal() || button.label !== '.'; else placeholder"
          type="button"
          mat-stroked-button
          (click)="onButtonClick(button)"
          class="min-h-[52px]"
        >
          {{ button.label }}
        </button>

        <!-- placeholder -->
        <ng-template #placeholder>
          <div></div>
        </ng-template>
      </ng-container>
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
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => NumberKeyboardComponent),
      multi: true,
    },
  ],
})
export class NumberKeyboardComponent {
  enableDecimal = input(false);

  /**
   * string value typed by user
   */
  private storedValue = '';

  // outputting number with maximum 2 decimal -> i.e: 122.33
  onChange: (data: string) => void = () => {};
  onTouched = () => {};

  KeyboardComponent = KeyboardComponentValues;

  onButtonClick(keyboard: KeyboardComponentType) {
    let value = this.storedValue;
    // remove last char
    if (keyboard.value === 'back') {
      value = value.slice(0, value.length - 1);
      this.storedValue = value;
      this.onChange(value);
      return;
    }

    // prevent double decimal
    else if (value.includes('.') && keyboard.value === '.') {
      return;
    }

    // prevent decimal
    else if (!this.enableDecimal() && keyboard.value === '.') {
      return;
    }

    // prevent more than 2 values after decimal
    else if (value.includes('.') && value.length - 1 - value.indexOf('.') == 2) {
      value = value.slice(0, value.length - 1);
    }

    // append chart
    value = value + keyboard.value;
    this.storedValue = value;
    this.onChange(value);
  }

  writeValue(value?: string): void {
    this.storedValue = value ?? '';
  }

  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: NumberKeyboardComponent['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: NumberKeyboardComponent['onTouched']): void {
    this.onTouched = fn;
  }
}
