import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { StockOwnershipHoldersTableComponent, StockOwnershipInstitutionalListComponent } from '@mm/market-stocks/ui';
import { InputSource } from '@mm/shared/data-access';
import { dateFormatDate } from '@mm/shared/general-util';
import {
  DropdownControlComponent,
  FormMatInputWrapperComponent,
  GeneralCardComponent,
  RangeDirective,
} from '@mm/shared/ui';
import { filterNil } from 'ngxtension/filter-nil';
import { catchError, filter, of, startWith, switchMap, tap } from 'rxjs';
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
    DropdownControlComponent,
  ],
  template: `
    <div class="mb-6 grid gap-8 md:grid-cols-2 xl:grid-cols-4">
      <!-- Institution -->
      <app-general-card title="Institution" additionalClasses="max-xl:w-full xl:min-w-[350px]">
        @if (enterpriseValueToQuarterSignal(); as enterpriseValueToQuarterSignal) {
          @if (ownershipInstitutionalToQuarterSignal(); as ownershipInstitutionalToQuarterSignal) {
            <app-stock-ownership-institutional-list
              displayType="institution"
              [isLoading]="loadingSignal()"
              [enterpriseValue]="enterpriseValueToQuarterSignal"
              [ownershipInstitutional]="ownershipInstitutionalToQuarterSignal"
            />
          }
        }
      </app-general-card>

      <!-- Position -->
      <app-general-card title="Position" additionalClasses="max-xl:w-full xl:min-w-[250px]">
        @if (enterpriseValueToQuarterSignal(); as enterpriseValueToQuarterSignal) {
          @if (ownershipInstitutionalToQuarterSignal(); as ownershipInstitutionalToQuarterSignal) {
            <app-stock-ownership-institutional-list
              displayType="position"
              [isLoading]="loadingSignal()"
              [enterpriseValue]="enterpriseValueToQuarterSignal"
              [ownershipInstitutional]="ownershipInstitutionalToQuarterSignal"
            />
          }
        }
      </app-general-card>

      <!-- Option -->
      <app-general-card title="Option" additionalClasses="max-xl:w-full xl:min-w-[300px]">
        @if (enterpriseValueToQuarterSignal(); as enterpriseValueToQuarterSignal) {
          @if (ownershipInstitutionalToQuarterSignal(); as ownershipInstitutionalToQuarterSignal) {
            <app-stock-ownership-institutional-list
              displayType="option"
              [isLoading]="loadingSignal()"
              [enterpriseValue]="enterpriseValueToQuarterSignal"
              [ownershipInstitutional]="ownershipInstitutionalToQuarterSignal"
            />
          }
        }
      </app-general-card>

      <div class="w-full">
        <!-- Available Quarters -->
        <app-dropdown-control
          [formControl]="quarterFormControl"
          inputCaption="Available Quarters"
          [inputSource]="institutionalPortfolioInputSourceSignal()"
        />

        <!-- additional data -->
        <div class="mt-2 grid gap-2 p-4">
          <div class="g-item-wrapper text-base">
            <span> Date: </span>
            <span>{{ quarterFormControl.value | date: 'MMMM d, y' }}</span>
          </div>
          <div class="g-item-wrapper text-base">
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
        <app-stock-ownership-holders-table *ngIf="ownershipHoldersToDateSignal() as data" [data]="data" />
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
  readonly quarterFormControl = new FormControl<string | null>(null);
  readonly loadingSignal = signal(false);

  readonly quarterFormControlSignal = toSignal(this.quarterFormControl.valueChanges);
  readonly ownershipInstitutionalSignal = toSignal(
    this.stocksApiService.getStockOwnershipInstitutional(this.stockSymbolSignal()).pipe(
      tap((data) => {
        this.quarterFormControl.setValue(data[0]?.date ?? null);
      }),
    ),
  );
  readonly ownershipHoldersToDateSignal = toSignal(
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

  readonly institutionalPortfolioInputSourceSignal = computed(() =>
    this.ownershipInstitutionalSignal()?.map(
      (d) =>
        ({
          caption: dateFormatDate(d.date, 'MMMM d, yyyy'),
          value: d.date,
        }) as InputSource<string>,
    ),
  );

  readonly historicalPriceOnDateSignal = toSignal(
    this.quarterFormControl.valueChanges.pipe(
      startWith(this.quarterFormControl.value),
      filterNil(),
      switchMap((quarter) =>
        this.marketApiService
          .getHistoricalPricesOnDate(this.stockSymbolSignal(), quarter)
          .pipe(catchError((e) => of(null))),
      ),
    ),
  );

  readonly enterpriseValueToQuarterSignal = computed(() =>
    this.stockDetailsSignal().enterpriseValue.find((d) => d.date === this.quarterFormControlSignal()),
  );
  readonly ownershipInstitutionalToQuarterSignal = computed(() =>
    this.ownershipInstitutionalSignal()?.find((d) => d.date === this.quarterFormControlSignal()),
  );
}
