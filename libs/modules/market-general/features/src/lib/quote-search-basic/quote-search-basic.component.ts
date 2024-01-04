import { ScrollingModule } from '@angular/cdk/scrolling';
import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  Input,
  OnChanges,
  SimpleChanges,
  computed,
  inject,
  signal,
} from '@angular/core';
import { ControlValueAccessor, FormsModule, NG_VALUE_ACCESSOR, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule, MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSelectModule } from '@angular/material/select';
import { MarketApiService } from '@market-monitor/api-client';
import { AvailableQuotes, SymbolQuote } from '@market-monitor/api-types';
import {
  ClientStylesDirective,
  DefaultImgDirective,
  QuoteItemComponent,
  RangeDirective,
} from '@market-monitor/shared/ui';
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
    ClientStylesDirective,
  ],
  template: `
    <mat-form-field class="w-full" [ngClass]="size">
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
          <cdk-virtual-scroll-viewport
            [itemSize]="50"
            appClientStyles
            [appMinHeight]="8 * 50"
            minBufferPx="380"
            maxBufferPx="400"
          >
            <mat-option
              *cdkVirtualFor="let quote of displayedOptions(); let last = last"
              [value]="quote"
              class="py-2 rounded-md"
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
export class QuoteSearchBasicComponent implements ControlValueAccessor, OnChanges {
  @Input({ required: true }) type!: AvailableQuotes;
  @Input() size: 'small' = 'small';

  marketApiService = inject(MarketApiService);

  searchControlSignal = signal<string>('');
  showLoadingIndicator = signal<boolean>(false);
  displayedOptions = computed(() =>
    this.options().filter((quote) => quote.name.toLowerCase().includes(this.searchControlSignal().toLowerCase())),
  );
  private options = signal<SymbolQuote[]>([]);

  onChange: (value: SymbolQuote) => void = () => {};
  onTouched = () => {};

  constructor() {}
  ngOnChanges(changes: SimpleChanges): void {
    if (changes?.['type']?.currentValue) {
      this.loadQuotesByType();
    }
  }

  private loadQuotesByType() {
    this.showLoadingIndicator.set(true);
    this.marketApiService
      .getQuotesByType(this.type)
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
