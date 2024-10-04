import { ScrollingModule } from '@angular/cdk/scrolling';
import { NgClass } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input, signal } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MarketApiService } from '@mm/api-client';
import { AvailableQuotes, SymbolQuote } from '@mm/api-types';
import { DefaultImgDirective, QuoteItemComponent, RangeDirective } from '@mm/shared/ui';
import { combineLatest, map, switchMap } from 'rxjs';

@Component({
  selector: 'app-quote-search-basic',
  standalone: true,
  imports: [
    NgClass,
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
    MatProgressSpinnerModule,
    FormsModule,
    ScrollingModule,
    MatButtonModule,
  ],
  template: `
    <mat-form-field class="w-full" [ngClass]="size()">
      <mat-label>Search quote</mat-label>
      <input
        type="text"
        placeholder="Enter ticker"
        aria-label="Text"
        matInput
        [ngModel]="searchControlSignal()"
        (ngModelChange)="searchControlSignal.set($event)"
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
        <!-- loaded data -->
        <cdk-virtual-scroll-viewport [itemSize]="50" class="h-[400px]" minBufferPx="380" maxBufferPx="400">
          <div class="divide-wt-border divide-y-2 px-4">
            <mat-option *cdkVirtualFor="let quote of displayedOptions(); let last = last" [value]="quote" class="py-2">
              <app-quote-item [displayImage]="false" [symbolQuote]="quote" />
            </mat-option>
          </div>
        </cdk-virtual-scroll-viewport>

        <!-- cancel button -->
        <button (click)="onSearchCancel()" mat-stroked-button type="button" class="w-full">Cancel</button>
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: `
    :host {
      display: block;

      ::ng-deep {
        .mat-mdc-autocomplete-panel {
          max-height: 420px !important;

          @screen md {
            min-width: 600px;
          }
        }

        .small .mat-mdc-form-field-infix {
          max-height: 45px !important;
          min-height: 45px !important;
        }
      }

      ::ng-deep .mat-mdc-form-field-subscript-wrapper {
        display: none !important;
      }
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: QuoteSearchBasicComponent,
      multi: true,
    },
  ],
})
export class QuoteSearchBasicComponent implements ControlValueAccessor {
  private readonly marketApiService = inject(MarketApiService);

  readonly type = input.required<AvailableQuotes>();
  readonly size = input<'small'>('small');

  readonly searchControlSignal = signal<string>('');

  readonly displayedOptions = toSignal(
    combineLatest([
      toObservable(this.type).pipe(switchMap((type) => this.marketApiService.getQuotesByType(type))),
      toObservable(this.searchControlSignal),
    ]).pipe(
      map(([quotesData, searchQuotePrefix]) =>
        quotesData.filter((quote) => quote.name.toLowerCase().includes(searchQuotePrefix.toLowerCase())),
      ),
      map((quotes) =>
        // indexes do not have displaySymbol
        quotes.map(
          (d) =>
            ({
              ...d,
              displaySymbol: d.name,
            }) satisfies SymbolQuote,
        ),
      ),
    ),

    { initialValue: [] },
  );

  onChange: (value: SymbolQuote) => void = () => {};
  onTouched = () => {};

  onStockSelect(event: MatAutocompleteSelectedEvent): void {
    const quote = event.option.value as SymbolQuote;
    this.onChange(quote);
    this.searchControlSignal.set(quote.name);
  }

  onSearchCancel(): void {
    this.searchControlSignal.set('');
  }

  displayProperty = (quote?: SymbolQuote | string) => (typeof quote === 'string' ? quote : (quote?.name ?? ''));

  /*
      parent component adds value to child
    */
  writeValue(data?: SymbolQuote): void {}

  /*
      method to notify parent that the value (disabled state) has been changed
    */
  registerOnChange(fn: QuoteSearchBasicComponent['onChange']): void {
    this.onChange = fn;
  }

  /*
      method to notify parent that form control has been touched
    */
  registerOnTouched(fn: QuoteSearchBasicComponent['onTouched']): void {
    this.onTouched = fn;
  }
}
