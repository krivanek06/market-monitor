import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { AddColorDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-portfolio-state-risk',
  standalone: true,
  imports: [CommonModule, AddColorDirective],
  template: `
    <div [class]="classes">
      <!-- Alpha -->
      <div [class]="valueClasses">
        <div [appAddColor]="titleColor" class="text-xl">Alpha</div>
        <div [appAddColor]="valueColor" class="text-xl">N/A</div>
      </div>

      <!-- Beta -->
      <div [class]="valueClasses">
        <div [appAddColor]="titleColor" class="text-xl">Beta</div>
        <div [appAddColor]="valueColor" class="text-xl">N/A</div>
      </div>

      <!-- Sharp Ratio -->
      <div [class]="valueClasses">
        <div [appAddColor]="titleColor" class="text-xl">Sharp Ratio</div>
        <div [appAddColor]="valueColor" class="text-xl">N/A</div>
      </div>

      <!-- Volatility -->
      <div [class]="valueClasses">
        <div [appAddColor]="titleColor" class="text-xl">Volatility</div>
        <div [appAddColor]="valueColor" class="text-xl">N/A</div>
      </div>
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
})
export class PortfolioStateRiskComponent {
  @Input() titleColor?: ColorScheme;
  @Input() valueColor?: ColorScheme;
  @Input() isLayoutHorizontal = false;
  @Input() classes = 'grid gap-4 sm:grid-cols-2';

  get valueClasses(): string {
    const position = this.isLayoutHorizontal ? 'flex-row justify-between' : 'flex-col';
    return `flex gap-y-2 ${position}`;
  }
}
