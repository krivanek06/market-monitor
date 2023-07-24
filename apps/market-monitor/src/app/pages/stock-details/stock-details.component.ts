import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LabelValue, TabSelectControlComponent } from '@market-monitor/shared-components';
import { DialogServiceModule } from '@market-monitor/shared-utils-client';
import { ROUTES_STOCK_DETAILS } from '../../routes.model';

@Component({
  selector: 'app-stock-details',
  standalone: true,
  imports: [CommonModule, RouterModule, TabSelectControlComponent, DialogServiceModule, ReactiveFormsModule],
  templateUrl: './stock-details.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: [
    `
      :host {
        @apply mt-14 block;
      }
    `,
  ],
})
export class StockDetailsComponent {
  router = inject(Router);
  route = inject(ActivatedRoute);
  routesStockDetailsControl = new FormControl<string>(ROUTES_STOCK_DETAILS.OVERVIEW);
  routesStockDetails: LabelValue<string>[] = [
    { label: 'Overview', value: ROUTES_STOCK_DETAILS.OVERVIEW },
    { label: 'Trades', value: ROUTES_STOCK_DETAILS.TRADES },
    { label: 'Financials', value: ROUTES_STOCK_DETAILS.FINANCIALS },
    { label: 'Ratios', value: ROUTES_STOCK_DETAILS.RATIOS },
  ];

  constructor() {
    this.resolveUrl();

    this.routesStockDetailsControl.valueChanges.subscribe((value) => {
      this.router.navigate([value], { relativeTo: this.route });
    });
  }

  /**
   * may happen that url is different than default value in routesStockDetailsControl
   */
  private resolveUrl(): void {
    const lastUrlSegment = this.router.url.split('?')[0].split('/').pop();
    if (lastUrlSegment) {
      this.routesStockDetailsControl.patchValue(lastUrlSegment);
    }
  }
}
