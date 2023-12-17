import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, Input } from '@angular/core';
import { ColorScheme } from '@market-monitor/shared/data-access';
import { AddColorDirective } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-portfolio-state-risk',
  standalone: true,
  imports: [CommonModule, AddColorDirective],
  templateUrl: './portfolio-state-risk.component.html',
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
