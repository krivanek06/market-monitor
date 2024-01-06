import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MarketApiService } from '@market-monitor/api-client';
import {
  StockOwnershipHoldersTableComponent,
  StockOwnershipInstitutionalListComponent,
} from '@market-monitor/modules/market-stocks/ui';
import { InputSource } from '@market-monitor/shared/data-access';
import {
  dateFormatDate,
  getPreviousDate,
  isStockMarketHolidayDate,
} from '@market-monitor/shared/features/general-util';
import { FormMatInputWrapperComponent, GeneralCardComponent, RangeDirective } from '@market-monitor/shared/ui';
import { catchError, filter, map, of, startWith, switchMap, tap } from 'rxjs';
import { PageStockDetailsBase } from '../page-stock-details-base';

@Component({
  selector: 'app-page-stock-details-holders',
  standalone: true,
  imports: [
    CommonModule,
    StockOwnershipInstitutionalListComponent,
    StockOwnershipHoldersTableComponent,
    GeneralCardComponent,
    FormMatInputWrapperComponent,
    ReactiveFormsModule,
    RangeDirective,
  ],
  template: `
    <div class="grid gap-8 mb-6 md:grid-cols-2 xl:grid-cols-4">
      <!-- Institution -->
      <app-general-card title="Institution" additionalClasses="max-xl:w-full xl:min-w-[350px]">
        <app-stock-ownership-institutional-list
          displayType="institution"
          [isLoading]="loadingSignal()"
          [enterpriseValue]="enterpriseValueToQuarterSignal()"
          [ownershipInstitutional]="ownershipInstitutionalToQuarterSignal()"
        ></app-stock-ownership-institutional-list>
      </app-general-card>

      <!-- Position -->
      <app-general-card title="Position" additionalClasses="max-xl:w-full xl:min-w-[250px]">
        <app-stock-ownership-institutional-list
          displayType="position"
          [isLoading]="loadingSignal()"
          [enterpriseValue]="enterpriseValueToQuarterSignal()"
          [ownershipInstitutional]="ownershipInstitutionalToQuarterSignal()"
        ></app-stock-ownership-institutional-list>
      </app-general-card>

      <!-- Option -->
      <app-general-card title="Option" additionalClasses="max-xl:w-full xl:min-w-[300px]">
        <app-stock-ownership-institutional-list
          displayType="option"
          [isLoading]="loadingSignal()"
          [enterpriseValue]="enterpriseValueToQuarterSignal()"
          [ownershipInstitutional]="ownershipInstitutionalToQuarterSignal()"
        ></app-stock-ownership-institutional-list>
      </app-general-card>

      <div class="w-full">
        <!-- Available Quarters -->
        <app-form-mat-input-wrapper
          [formControl]="quarterFormControl"
          inputCaption="Available Quarters"
          inputType="SELECT"
          [inputSource]="institutionalPortfolioInputSourceSignal()"
        ></app-form-mat-input-wrapper>

        <!-- additional data -->
        <div class="grid gap-2 p-4 mt-2">
          <div class="text-base g-item-wrapper">
            <span> Date: </span>
            <span>{{ quarterFormControl.value | date: 'MMMM d, y' }}</span>
          </div>
          <div class="text-base g-item-wrapper">
            <span> Close Price: </span>
            <span>{{ historicalPriceOnDateSignal() ? (historicalPriceOnDateSignal()?.close | currency) : 'N/A' }}</span>
          </div>
        </div>
      </div>
    </div>

    <app-general-card title="Ownership Holders">
      <!-- skeleton -->
      <div *ngIf="loadingSignal(); else showData" class="grid gap-2">
        <div *ngRange="25" class="g-skeleton h-[50px]"></div>
      </div>

      <ng-template #showData>
        <app-stock-ownership-holders-table
          *ngIf="ownershipHoldersToDateSignal() as data"
          [data]="data"
        ></app-stock-ownership-holders-table>
      </ng-template>
    </app-general-card>
  `,
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { ngSkipHydration: 'true' },
})
export class PageStockDetailsHoldersComponent extends PageStockDetailsBase {
  marketApiService = inject(MarketApiService);

  quarterFormControl = new FormControl<string | null>(null);
  loadingSignal = signal(false);

  quarterFormControlSignal = toSignal(this.quarterFormControl.valueChanges);
  ownershipInstitutionalSignal = toSignal(
    this.stocksApiService.getStockOwnershipInstitutional(this.stockSymbolSignal()).pipe(
      tap((data) => {
        this.quarterFormControl.setValue(data[0]?.date ?? null);
      }),
    ),
  );
  ownershipHoldersToDateSignal = toSignal(
    this.quarterFormControl.valueChanges.pipe(
      startWith(this.quarterFormControl.value),
      filter((data): data is string => !!data),
      tap(() => this.loadingSignal.set(true)),
      switchMap((quarter) =>
        this.stocksApiService
          .getStockOwnershipHoldersToDate(this.stockSymbolSignal(), quarter)
          .pipe(tap(() => this.loadingSignal.set(false))),
      ),
    ),
  );

  institutionalPortfolioInputSourceSignal = computed(
    () =>
      this.ownershipInstitutionalSignal()?.map(
        (d) =>
          ({
            caption: dateFormatDate(d.date, 'MMMM d, yyyy'),
            value: d.date,
          }) as InputSource<string>,
      ),
  );

  historicalPriceOnDateSignal = toSignal(
    this.quarterFormControl.valueChanges.pipe(
      startWith(this.quarterFormControl.value),
      filter((data): data is string => !!data),
      // if date is YYYY-12-31 then it is a closed date -> subtract 1 day
      map((quarter) => (isStockMarketHolidayDate(quarter) ? getPreviousDate(quarter) : quarter)),
      switchMap((quarter) =>
        this.stocksApiService
          .getStockHistoricalPricesOnDate(this.stockSymbolSignal(), quarter)
          .pipe(catchError((e) => of(null))),
      ),
    ),
  );

  enterpriseValueToQuarterSignal = computed(() =>
    this.stockDetailsSignal().enterpriseValue.find((d) => d.date === this.quarterFormControlSignal()),
  );
  ownershipInstitutionalToQuarterSignal = computed(
    () => this.ownershipInstitutionalSignal()?.find((d) => d.date === this.quarterFormControlSignal()),
  );

  constructor() {
    super();
  }
}
