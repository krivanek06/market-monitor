import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-progress-currency',
  template: `
    <div>
      <input
        type="range"
        [min]="!min ? 0 : min"
        [max]="!max ? value : max"
        [value]="!value ? 0 : value"
        class="slider"
        disabled
      />
    </div>
    <div class="flex items-center justify-between">
      <span class="text-xs text-wt-gray-medium">{{ min | currency }} </span>
      <span class="text-xs text-wt-gray-medium">{{ max | currency }} </span>
    </div>
  `,
  styles: [
    `
      .slider {
        -webkit-appearance: none;
        width: 100%;
        height: 11px;
        background: #d3d3d3;
        outline: none;
        opacity: 0.7;
        -webkit-transition: 0.2s;
        border-radius: 8px;
        /* transition: opacity .2s;*/
      }

      .slider:hover {
        opacity: 1;
      }

      .slider::-webkit-slider-thumb {
        -webkit-appearance: none;
        appearance: none;
        width: 8px;
        height: 11px;
        border-radius: 3px;
        background: #1b8b2e;
      }

      .slider::-moz-range-thumb {
        width: 8px;
        height: 11px;
        border-radius: 3px;
        background: #1b8b2e;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule],
})
export class ProgressCurrencyComponent implements OnInit {
  @Input({ required: true }) min!: number;
  @Input({ required: true }) max!: number;
  @Input({ required: true }) value?: number | null;

  constructor() {}

  ngOnInit(): void {}
}
