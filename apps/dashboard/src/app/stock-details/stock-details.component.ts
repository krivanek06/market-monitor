import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { LabelValue, ROUTES_STOCK_DETAILS } from '@mm/shared/data-access';
import { TabSelectControlComponent } from '@mm/shared/ui';

@Component({
  selector: 'app-stock-details',
  standalone: true,
  imports: [RouterModule, TabSelectControlComponent, ReactiveFormsModule, MatButtonModule, MatIconModule],
  template: `
    <section>
      <div class="mb-6 flex justify-end">
        <!-- main navigation -->
        <app-tab-select-control
          class="w-full md:w-[450px] xl:w-auto"
          [formControl]="routesStockDetailsControl"
          [displayOptions]="routesStockDetails"
          screenLayoutSplit="LAYOUT_XL"
        />
      </div>

      <router-outlet />
    </section>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      @apply mt-6 block;
    }
  `,
})
export class StockDetailsComponent {
  readonly router = inject(Router);
  readonly route = inject(ActivatedRoute);
  readonly routesStockDetailsControl = new FormControl<string>(ROUTES_STOCK_DETAILS.OVERVIEW);
  readonly routesStockDetails: LabelValue<string>[] = [
    { label: 'Overview', value: ROUTES_STOCK_DETAILS.OVERVIEW },
    { label: 'Financials', value: ROUTES_STOCK_DETAILS.FINANCIALS },
    { label: 'Ratios', value: ROUTES_STOCK_DETAILS.RATIOS },
    { label: 'News', value: ROUTES_STOCK_DETAILS.NEWS },
    // { label: 'Holders', value: ROUTES_STOCK_DETAILS.HOLDERS },
    { label: 'Trades', value: ROUTES_STOCK_DETAILS.TRADES },
  ];

  constructor() {
    this.resolveUrl();

    // navigate to selected tab
    this.routesStockDetailsControl.valueChanges.pipe(takeUntilDestroyed()).subscribe((value) => {
      this.router.navigate([value], { relativeTo: this.route });
    });
  }

  onHomeClick(): void {
    this.router.navigate(['']);
  }

  /**
   * may happen that url is different than default value in routesStockDetailsControl
   */
  private resolveUrl(): void {
    const slittedUrl = this.router.url.split('?');
    if (!slittedUrl[0]) {
      return;
    }
    const lastUrlSegment = slittedUrl[0].split('/').pop();
    if (lastUrlSegment) {
      this.routesStockDetailsControl.patchValue(lastUrlSegment);
    }
  }
}
