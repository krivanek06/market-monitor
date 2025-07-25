import { ChangeDetectionStrategy, Component, forwardRef, input } from '@angular/core';
import { NG_VALUE_ACCESSOR } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { roundNDigits } from '@mm/shared/general-util';

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
  imports: [MatButtonModule],
  template: `
    <div class="grid grid-cols-3 gap-2">
      @for (button of KeyboardComponent; track button.value) {
        @if (enableDecimal() || button.label !== '.') {
          <button type="button" mat-stroked-button (click)="onButtonClick(button)" class="min-h-[48px]">
            {{ button.label }}
          </button>
        } @else {
          <!-- placeholder for space -->
          <div></div>
        }
      }
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
   * limit decimal to 2
   */
  decimalLimit = input(2);

  /**
   * string value typed by user, allows better manipulation like put '.' in the middle
   */
  private storedValue = '';

  // outputting number with maximum 2 decimal -> i.e: 122.33
  onChange: (data: number) => void = () => {};
  onTouched = () => {};

  KeyboardComponent = KeyboardComponentValues;

  onButtonClick(keyboard: KeyboardComponentType) {
    let value = this.storedValue;

    // remove last char
    if (keyboard.value === 'back') {
      value = value.slice(0, value.length - 1);
      this.storedValue = value;
      this.notifyParent();
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
    else if (value.includes('.') && value.length - 1 - value.indexOf('.') == this.decimalLimit()) {
      value = value.slice(0, value.length - 1);
    }

    // append chart
    value = value + keyboard.value;
    this.storedValue = value;
    this.notifyParent();
  }

  private notifyParent() {
    const exportValue = roundNDigits(Number(this.storedValue), this.decimalLimit());
    this.onChange(exportValue);
  }

  writeValue(value?: number): void {
    this.storedValue = String(value) ?? '';
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
