import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ColorScheme } from '@market-monitor/shared/data-access';

@Component({
  selector: 'app-fancy-card',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="h-full relative overflow-hidden px-6 pb-4 pt-4 rounded-md shadow-md" [style]="backgroundLinear">
      <!-- title -->
      <div *ngIf="title" class="pb-4 flex items-center gap-2">
        <div class="c-title-dot" [ngStyle]="{ 'background-color': colorPrimary }"></div>
        <div class="text-xl" [ngStyle]="{ color: colorPrimary }">
          {{ title }}
        </div>
      </div>

      <!-- content -->
      <div>
        <ng-content></ng-content>
      </div>

      <!-- circle for fancy styling -->
      <div class="c-fancy-circle c-left-circle"></div>
      <div class="c-fancy-circle c-upper-circle"></div>
      <div class="c-fancy-circle c-lower-circle"></div>
    </div>
  `,
  styles: [
    `
      :host {
        display: block;
      }

      .c-title-dot {
        height: 20px;
        width: 20px;
        border-radius: 50%;
        margin-right: 10px;
      }

      .c-fancy-circle {
        position: absolute;
        height: 100px;
        width: 100px;
        background-color: #ffffff47;
        opacity: 0.6;
        border-radius: 50%;
      }

      .c-upper-circle {
        top: -30px;
        right: -15px;
      }

      .c-left-circle {
        left: -45px;
        bottom: -50px;
      }

      .c-lower-circle {
        right: -25px;
        bottom: -35px;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FancyCardComponent {
  @Input() title?: string;
  @Input() colorPrimary: ColorScheme = ColorScheme.PRIMARY_VAR;

  get backgroundLinear(): string {
    return `background: linear-gradient(135deg,
        color-mix(in srgb, ${this.colorPrimary} 55%, white),
        color-mix(in srgb, ${this.colorPrimary} 40%, white)
      );`;
  }
}
