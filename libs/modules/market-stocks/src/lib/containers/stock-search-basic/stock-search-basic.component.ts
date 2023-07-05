import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Output, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StocksApiService } from '@market-monitor/api-client';
import { StockSummary } from '@market-monitor/api-types';
import { QuoteItemComponent } from '@market-monitor/shared-components';
import { DefaultImgDirective, RangeDirective } from '@market-monitor/shared-directives';
import { catchError, debounceTime, distinctUntilChanged, filter, switchMap, tap } from 'rxjs';

@Component({
  selector: 'app-stock-search-basic',
  standalone: true,
  imports: [
    CommonModule,
    MatAutocompleteModule,
    ReactiveFormsModule,
    MatInputModule,
    MatFormFieldModule,
    MatSelectModule,
    RangeDirective,
    DefaultImgDirective,
    MatDividerModule,
    MatIconModule,
    QuoteItemComponent,
  ],
  templateUrl: './stock-search-basic.component.html',
  styleUrls: ['./stock-search-basic.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: StockSearchBasicComponent,
      multi: true,
    },
  ],
})
export class StockSearchBasicComponent implements ControlValueAccessor {
  /**
   * emit whether searchControl has any value
   */
  @Output() inputHasValue = new EventEmitter<boolean>();

  searchControl = new FormControl<string>('', { nonNullable: true });

  StocksApiService = inject(StocksApiService);
  showLoadingIndicator = signal<boolean>(false);
  options = signal<StockSummary[]>([]);

  onChange: (value: StockSummary) => void = () => {};
  onTouched = () => {};

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        // check if type is string and not empty
        filter((d) => typeof d === 'string'),
        tap((value) => {
          this.showLoadingIndicator.set(true);
          this.options.set([]);
          this.inputHasValue.emit(!!value.length);
        }),
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((value) =>
          this.StocksApiService.getStockSummariesByTicker(value).pipe(
            tap(() => this.showLoadingIndicator.set(false)),
            catchError(() => [])
          )
        ),
        tap((data) => this.options.set(data)),
        takeUntilDestroyed()
      )
      .subscribe();
  }

  onStockSelect(event: MatAutocompleteSelectedEvent): void {
    const stock = event.option.value as StockSummary;
    console.log(stock);
    this.onChange(stock);
    this.searchControl.setValue('', { emitEvent: true });
  }

  displayProperty = (stock: StockSummary) => stock.id;

  /*
    parent component adds value to child
  */
  writeValue(data?: any): void {}

  /*
    method to notify parent that the value (disabled state) has been changed
  */
  registerOnChange(fn: StockSearchBasicComponent['onChange']): void {
    this.onChange = fn;
  }

  /*
    method to notify parent that form control has been touched
  */
  registerOnTouched(fn: StockSearchBasicComponent['onTouched']): void {
    this.onTouched = fn;
  }
}
