import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormControl,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import {
  MatAutocompleteModule,
  MatAutocompleteSelectedEvent,
} from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StocksApiService } from '@market-monitor/api';
import {
  DefaultImgDirective,
  RangeDirective,
} from '@market-monitor/directives';
import { StockSummary } from '@market-monitor/shared-types';
import {
  catchError,
  debounceTime,
  distinctUntilChanged,
  filter,
  switchMap,
  tap,
} from 'rxjs';
import { StockDisplayItemComponent } from '../../components';
@Component({
  selector: 'app-stock-basic-search',
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
    StockDisplayItemComponent,
  ],
  templateUrl: './stock-basic-search.component.html',
  styleUrls: ['./stock-basic-search.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: StockBasicSearchComponent,
      multi: true,
    },
  ],
})
export class StockBasicSearchComponent implements ControlValueAccessor {
  searchControl = new FormControl<string>('', { nonNullable: true });

  StocksApiService = inject(StocksApiService);

  selectedSummary = signal<StockSummary | null>(null);
  showLoadingIndicator = signal<boolean>(false);
  options = signal<StockSummary[]>([]);

  onChange: (value: StockSummary) => void = () => {};
  onTouched = () => {};

  constructor() {
    this.searchControl.valueChanges
      .pipe(
        // check if type is string and not empty
        filter((d) => typeof d === 'string'),
        tap(() => {
          this.showLoadingIndicator.set(true);
          this.options.set([]);
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
    this.searchControl.setValue('', { emitEvent: false });
  }

  displayProperty = (stock: StockSummary) => stock.id;

  /*
    parent component adds value to child
  */
  writeValue(data?: any): void {}

  /*
    method to notify parent that the value (disabled state) has been changed
  */
  registerOnChange(fn: StockBasicSearchComponent['onChange']): void {
    this.onChange = fn;
  }

  /*
    method to notify parent that form control has been touched
  */
  registerOnTouched(fn: StockBasicSearchComponent['onTouched']): void {
    this.onTouched = fn;
  }
}
