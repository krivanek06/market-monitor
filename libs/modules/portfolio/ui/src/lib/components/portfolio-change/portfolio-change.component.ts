import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-portfolio-change',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './portfolio-change.component.html',
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PortfolioChangeComponent {}
