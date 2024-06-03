import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MarketApiService } from '@mm/api-client';
import { AvailableQuotes, SymbolQuote } from '@mm/api-types';
import { DefaultImgDirective, QuoteItemComponent, RangeDirective } from '@mm/shared/ui';
import { tap } from 'rxjs';

@Component({
  selector: 'app-quote-search-basic',
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
    MatProgressSpinnerModule,
    FormsModule,
    ScrollingModule,
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
        <!-- loading skeleton -->
        <div *ngIf="showLoadingIndicator()" class="h-[220px]">
          <mat-spinner [diameter]="80"></mat-spinner>
        </div>

        <!-- loaded data -->
        <ng-container *ngIf="!showLoadingIndicator()">
          <cdk-virtual-scroll-viewport [itemSize]="50" class="h-[400px]" minBufferPx="380" maxBufferPx="400">
            <mat-option
              *cdkVirtualFor="let quote of displayedOptions(); let last = last"
              [value]="quote"
              class="rounded-md py-2"
            >
              <app-quote-item [symbolQuote]="quote"></app-quote-item>
              <mat-divider *ngIf="!last"></mat-divider>
            </mat-option>
          </cdk-virtual-scroll-viewport>
        </ng-container>
      </mat-autocomplete>
    </mat-form-field>
  `,
  styles: `
    :host {
      display: block;
    }

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
  private marketApiService = inject(MarketApiService);

  type = input.required<AvailableQuotes>();
  size = input<'small'>('small');

  searchControlSignal = signal<string>('');
  showLoadingIndicator = signal<boolean>(false);
  displayedOptions = computed(() =>
    this.options().filter((quote) => quote.name.toLowerCase().includes(this.searchControlSignal().toLowerCase())),
  );
  private options = signal<SymbolQuote[]>([]);

  onChange: (value: SymbolQuote) => void = () => {};
  onTouched = () => {};

  loadQuotesEffect = effect(
    () => {
      this.loadQuotesByType(this.type());
    },
    { allowSignalWrites: true },
  );

  private loadQuotesByType(type: AvailableQuotes) {
    this.showLoadingIndicator.set(true);
    this.marketApiService
      .getQuotesByType(type)
      .pipe(
        tap((quotes) => {
          this.options.set(quotes);
          this.showLoadingIndicator.set(false);
        }),
      )
      .subscribe();
  }

  onStockSelect(event: MatAutocompleteSelectedEvent): void {
    const quote = event.option.value as SymbolQuote;
    this.onChange(quote);
    this.searchControlSignal.set(quote.name);
  }

  displayProperty = (quote?: SymbolQuote | string) => (typeof quote === 'string' ? quote : quote?.name ?? '');

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
