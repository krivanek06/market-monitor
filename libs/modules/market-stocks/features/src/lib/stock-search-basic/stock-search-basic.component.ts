import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, EventEmitter, Input, Output, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormControl, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { StocksApiService } from '@market-monitor/api-client';
import { SymbolSummary } from '@market-monitor/api-types';
import { DefaultImgDirective, QuoteItemComponent, RangeDirective } from '@market-monitor/shared/ui';
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
  template: `
    <mat-form-field class="w-full">
      <mat-label>Search stock by ticker</mat-label>
      <input
        type="text"
        placeholder="Enter ticker"
        aria-label="Text"
        matInput
        [formControl]="searchControl"
        [matAutocomplete]="auto"
      />
      <mat-icon matPrefix>search</mat-icon>
      <mat-autocomplete
        #auto="matAutocomplete"
        (optionSelected)="onStockSelect($event)"
        [displayWith]="displayProperty"
        [hideSingleSelectionIndicator]="true"
        [autofocus]="false"
        [autoActiveFirstOption]="false"
      >
        <!-- loading skeleton -->
        <ng-container *ngIf="showLoadingIndicator()">
          <mat-option *ngRange="5" class="h-10 mb-1 g-skeleton"></mat-option>
        </ng-container>

        <!-- loaded data -->
        <ng-container *ngIf="!showLoadingIndicator()">
          <mat-option *ngFor="let summary of options(); let last = last" [value]="summary" class="py-2 rounded-md">
            <app-quote-item
              [showValueChange]="showValueChange"
              [symbolQuote]="summary.quote"
              [displayValue]="displayValue"
            ></app-quote-item>
            <div *ngIf="!last" class="mt-2">
              <mat-divider></mat-divider>
            </div>
          </mat-option>
        </ng-container>
      </mat-autocomplete>
      <mat-hint *ngIf="showHint">Ex: 'AAPL, MSFT, UBER, NFLX'</mat-hint>
    </mat-form-field>
  `,
  styles: `
      :host {
        display: block;
      }

      ::ng-deep .mdc-menu-surface.mat-mdc-autocomplete-panel {
        max-height: 452px !important;
      }

      ::ng-deep .mdc-menu-surface.mat-mdc-autocomplete-panel {
        width: 95% !important;
        margin: auto !important;
      }
    `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: StockSearchBasicComponent,
      multi: true,
    },
  ],
  host: { ngSkipHydration: 'true' },
})
export class StockSearchBasicComponent implements ControlValueAccessor {
  /**
   * emit whether searchControl has any value
   */
  @Output() inputHasValue = new EventEmitter<boolean>();
  @Input() showHint = true;
  @Input() showValueChange = true;
  @Input() displayValue: 'name' | 'symbol' = 'name';

  searchControl = new FormControl<string>('', { nonNullable: true });

  StocksApiService = inject(StocksApiService);
  showLoadingIndicator = signal<boolean>(false);
  options = signal<SymbolSummary[]>([]);

  onChange: (value: SymbolSummary) => void = () => {};
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
          this.StocksApiService.searchStockSummariesByPrefix(value).pipe(
            tap(() => this.showLoadingIndicator.set(false)),
            catchError(() => {
              this.showLoadingIndicator.set(false);
              return [];
            }),
          ),
        ),
        tap((data) => this.options.set(data)),
        takeUntilDestroyed(),
      )
      .subscribe();
  }

  onStockSelect(event: MatAutocompleteSelectedEvent): void {
    const stock = event.option.value as SymbolSummary;
    this.onChange(stock);
    this.searchControl.setValue('', { emitEvent: true });
  }

  displayProperty = (stock: SymbolSummary) => stock.id;

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
