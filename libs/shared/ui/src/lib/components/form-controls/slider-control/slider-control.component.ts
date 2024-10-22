import { ChangeDetectionStrategy, Component, effect, forwardRef, input, untracked } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatSliderModule } from '@angular/material/slider';

export type SliderControlConfig = {
  min: number;
  max: number;
  step?: number;
  displayWith?: (value: number) => string;
};

@Component({
  selector: 'app-slider-control',
  standalone: true,
  imports: [ReactiveFormsModule, MatSliderModule, FormsModule],
  template: `
    <div class="text-wt-gray-medium -mb-3 text-center text-xs">selected: {{ sliderControl.value }}</div>
    <mat-slider
      showTickMarks
      discrete
      ngDefaultControl
      [min]="config().min"
      [max]="config().max"
      [step]="config().step ?? 1"
      [displayWith]="config().displayWith ?? defaultFormatLabel"
      [formControl]="sliderControl"
    >
      <input matSliderThumb />
    </mat-slider>
  `,
  styles: `
    :host {
      display: block;
    }

    mat-slider {
      width: 100%;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => SliderControlComponent),
      multi: true,
    },
  ],
})
export class SliderControlComponent implements ControlValueAccessor {
  readonly sliderControl = new FormControl<number>(1, { nonNullable: true });
  readonly config = input.required<SliderControlConfig>();

  constructor() {
    effect(() => {
      const config = this.config();

      untracked(() => {
        // set the default value
        this.sliderControl.patchValue(config.min, { emitEvent: false });
      });
    });

    // listen on change
    this.sliderControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.onChange(Number(value));
      this.onTouched();
    });
  }

  onChange: (data: number) => void = () => {
    /** */
  };
  onTouched = () => {
    /** */
  };

  defaultFormatLabel(value: number): string {
    return value.toString();
  }

  writeValue(value: number | null): void {
    if (value === null) {
      return;
    }
    this.sliderControl.setValue(value, { emitEvent: false });
  }

  /**
   * Register Component's ControlValueAccessor onChange callback
   */
  registerOnChange(fn: SliderControlComponent['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: SliderControlComponent['onTouched']): void {
    this.onTouched = fn;
  }
}
