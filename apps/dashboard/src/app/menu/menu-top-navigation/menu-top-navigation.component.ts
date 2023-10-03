import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { StockSearchBasicCustomizedComponent } from '@market-monitor/modules/market-stocks/features';

@Component({
  selector: 'app-menu-top-navigation',
  standalone: true,
  imports: [CommonModule, StockSearchBasicCustomizedComponent, MatDialogModule],
  templateUrl: './menu-top-navigation.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MenuTopNavigationComponent {}
