import {
  ChangeDetectionStrategy,
  Component,
  computed,
  effect,
  forwardRef,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import {
  ControlValueAccessor,
  FormArray,
  FormControl,
  FormGroup,
  NG_VALUE_ACCESSOR,
  ReactiveFormsModule,
} from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MarketApiService } from '@mm/api-client';
import { STOCK_SYMBOLS, SymbolHistoricalPeriods, TradingSimulatorSymbol } from '@mm/api-types';
import {
  GenericChartSeries,
  intervalValidator,
  positiveNumberValidator,
  requiredValidator,
} from '@mm/shared/data-access';
import { getRandomElement } from '@mm/shared/general-util';
import {
  DatePickerComponent,
  DefaultImgDirective,
  FormMatInputWrapperComponent,
  GenericChartComponent,
  SliderControlComponent,
  SliderControlConfig,
} from '@mm/shared/ui';
import { catchError, firstValueFrom, of } from 'rxjs';

@Component({
  selector: 'app-trading-simulator-form-symbol',
  standalone: true,
  imports: [
    MatIconModule,
    ReactiveFormsModule,
    MatButtonModule,
    DatePickerComponent,
    DefaultImgDirective,
    MatTooltipModule,
    GenericChartComponent,
    FormMatInputWrapperComponent,
    MatCheckboxModule,
    SliderControlComponent,
  ],
  template: `
    <div class="mb-3 flex items-center justify-between">
      <!-- symbol image + symbol name -->
      <div class="flex items-center gap-2">
        <img appDefaultImg alt="symbol image" imageType="symbol" [src]="formData().symbol" class="h-8 w-8" />
        <span class="text-wt-primary">{{ formData().symbol }}</span>
      </div>

      <!-- action buttons -->
      <div class="flex gap-3">
        <!-- buttons to refresh symbol -->
        <button type="button" mat-stroked-button (click)="onChangeSymbol()">
          <mat-icon>refresh</mat-icon>
          Refresh symbol
        </button>

        <!-- buttons to refresh data -->
        <button type="button" mat-stroked-button (click)="onChangeHistoricalData()">
          <mat-icon>query_stats</mat-icon>
          Reload chart
        </button>

        <!-- buttons to remove symbol -->
        @if (!disabledRemove()) {
          <button type="button" mat-stroked-button color="warn" (click)="onRemoveSymbol()">
            <mat-icon>delete</mat-icon>
            Remove
          </button>
        }
      </div>
    </div>

    <div class="flex gap-6">
      <!-- chart -->
      @if (loadingSymbolData()) {
        <div class="h-[300px] basis-3/4">
          <div class="g-skeleton h-[280px]"></div>
        </div>
      } @else {
        <app-generic-chart
          class="basis-3/4"
          [series]="formDataChartSeries()"
          [categories]="roundPoints()"
          [heightPx]="300"
        />
      }

      <!-- form -->
      <div class="flex basis-1/4 flex-col gap-5 pt-2">
        <!-- infinite units -->
        <mat-checkbox
          [formControl]="form.controls.unitsInfinity"
          color="primary"
          matTooltip="Infinite units means that the symbol can be bought and sold without any limit"
        >
          Infinite units
        </mat-checkbox>

        <!-- starting units -->
        <app-form-mat-input-wrapper
          inputCaption="Starting units"
          inputType="NUMBER"
          hintText="Available units on the start"
          [formControl]="form.controls.unitsAvailableOnStart"
        />

        <!-- multiplication -->
        <app-form-mat-input-wrapper
          inputCaption="Price multiplication"
          inputType="NUMBER"
          hintText="Multiply the price displayed on the chart"
          [formControl]="form.controls.priceMultiplication"
        />

        <!-- add additional units -->
        <button mat-stroked-button color="primary" (click)="onAddAdditionalUnits()">
          <mat-icon>add</mat-icon>
          Additional units
        </button>
      </div>
    </div>

    <!-- additional issued units -->
    <div class="grid gap-x-10 gap-y-4 xl:grid-cols-2">
      @for (group of form.controls.unitsAdditionalIssued.controls; track $index; let i = $index) {
        <div class="flex gap-6">
          <!-- date to issue -->
          <app-slider-control
            [formControl]="group.controls.issuedOnRound"
            [config]="sliderControlConfig()"
            class="flex-1"
          />

          <!-- amount to issue -->
          <app-form-mat-input-wrapper
            inputCaption="Units to issue"
            inputType="NUMBER"
            [formControl]="group.controls.units"
            class="flex-1"
          />

          <!-- delete -->
          <button mat-icon-button color="warn" (click)="onRemoveAdditionalUnits(i)">
            <mat-icon>delete</mat-icon>
          </button>
        </div>
      }
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => TradingSimulatorFormSymbolComponent),
      multi: true,
    },
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingSimulatorFormSymbolComponent implements ControlValueAccessor {
  private readonly marketApiService = inject(MarketApiService);

  readonly removeSymbol = output<void>();

  readonly maximumRounds = input<number>(100);

  /** whether to display remove button */
  readonly disabledRemove = input<boolean>(false);

  // todo - on editing patch values to the form

  readonly marketChange = input<
    {
      startingRound?: number;
      endingRound?: number;
      valueChange?: number;
    }[]
  >([]);

  readonly loadingSymbolData = signal(false);

  /** generate array of round points: [1,2,3, ...] */
  readonly roundPoints = computed(() => Array.from({ length: this.maximumRounds() }, (_, i) => String(i + 1)));
  readonly sliderControlConfig = computed(
    () =>
      ({
        min: 1,
        max: this.maximumRounds(),
        step: 1,
      }) satisfies SliderControlConfig,
  );

  readonly form = new FormGroup({
    symbol: new FormControl<string>('', { nonNullable: true }),
    /** original historical data pulled from the internet */
    historicalData: new FormControl<{ date: string; price: number }[]>([], { nonNullable: true }),
    unitsAvailableOnStart: new FormControl<number>(1000, { nonNullable: true, validators: [positiveNumberValidator] }),
    unitsInfinity: new FormControl<boolean>(false, { nonNullable: true }),
    /** possible to issue more shares of a specific symbol */
    unitsAdditionalIssued: new FormArray<
      FormGroup<{
        issuedOnRound: FormControl<number>;
        units: FormControl<number>;
      }>
    >([]),
    /** possible to multiply every historical value by N times */
    priceMultiplication: new FormControl<number>(1, {
      nonNullable: true,
      validators: [positiveNumberValidator, intervalValidator(1, 20)],
    }),
  });

  /** form data as a signal to update UI on change */
  readonly formData = toSignal(this.form.valueChanges, { initialValue: this.form.value });
  readonly formDataChartSeries = computed(() => {
    const data = this.formData();
    const maxRounds = this.maximumRounds();
    const marketChange = this.marketChange();

    const multiply = data.priceMultiplication ?? 1;

    // multiply the historical data by the price multiplication
    const multipliedData = Array.from(
      { length: maxRounds },
      (_, i) => (data.historicalData?.at(i)?.price ?? 0) * multiply,
    );

    // apply market change
    const multipliedDataWithMarketChange = marketChange.reduce((acc, { startingRound, endingRound, valueChange }) => {
      if (startingRound && endingRound && valueChange) {
        for (let i = startingRound - 1; i < endingRound; i++) {
          acc[i] *= (100 + valueChange) / 100;
        }
      }

      return acc;
    }, multipliedData);

    // price data
    const modifiedPriceData: GenericChartSeries<'line'> = {
      type: 'line',
      name: `${data.symbol} price`,
      yAxis: 0,
      data: multipliedDataWithMarketChange,
    };

    // issued units
    const issuedUnits: GenericChartSeries<'column'> = {
      type: 'column',
      name: 'Issued units',
      yAxis: 1,
      opacity: 0.8,
      data: Array.from(
        { length: maxRounds },
        (_, i) => data.unitsAdditionalIssued?.find((d) => d.issuedOnRound === i + 1)?.units ?? null,
      ),
    };

    return [modifiedPriceData, issuedUnits];
  });

  /** available symbols to choose from */
  readonly STOCK_SYMBOLS = STOCK_SYMBOLS;

  readonly formDataEffect = effect(() => {
    const historicalDataModified = this.formDataChartSeries().at(0)?.data as number[];
    const formData = this.formData();
    const maxRounds = this.maximumRounds();

    if (!this.form.valid) {
      return;
    }

    const data: TradingSimulatorSymbol = {
      symbol: formData.symbol ?? 'Unknown',
      unitsCurrentlyAvailable: formData.unitsAvailableOnStart ?? 0,
      unitsAvailableOnStart: formData.unitsAvailableOnStart ?? 0,
      unitsAdditionalIssued:
        formData.unitsAdditionalIssued?.map((d) => ({
          issuedOnRound: d.issuedOnRound ?? 0,
          units: d.units ?? 0,
        })) ?? [],
      // save modified historical data
      historicalDataModified: Array.from({ length: historicalDataModified.length }, (_, i) => ({
        round: i + 1,
        price: historicalDataModified[i],
      })),
      // save original historical data
      historicalDataOriginal: Array.from({ length: maxRounds }, (_, i) => ({
        round: i + 1,
        price: formData.historicalData?.at(i)?.price ?? 0,
      })),
    };

    // notify the parent component about the change
    this.onChange(data);
    this.onTouched();
  });

  constructor() {
    // disable the unitsAvailableOnStart when unitsInfinity is checked
    this.form.controls.unitsInfinity.valueChanges.pipe(takeUntilDestroyed()).subscribe((res) => {
      if (res) {
        this.form.controls.unitsAvailableOnStart.disable();
      } else {
        this.form.controls.unitsAvailableOnStart.enable();
      }

      // update the form value
      this.form.controls.unitsInfinity.updateValueAndValidity({ emitEvent: false });
    });

    // fill the form with random data
    this.fillFormData();
  }

  onChange: (value: TradingSimulatorSymbol) => void = () => {
    /** */
  };
  onTouched = () => {
    /** */
  };

  onAddAdditionalUnits() {
    // create control
    const unitsAdditionalIssued = new FormGroup({
      issuedOnRound: new FormControl<number>(1, {
        nonNullable: true,
        validators: [positiveNumberValidator, requiredValidator],
      }),
      units: new FormControl<number>(100, {
        nonNullable: true,
        validators: [positiveNumberValidator, requiredValidator],
      }),
    });

    // add to the form
    this.form.controls.unitsAdditionalIssued.push(unitsAdditionalIssued);
  }

  onRemoveAdditionalUnits(index: number) {
    this.form.controls.unitsAdditionalIssued.removeAt(index);
  }

  onRemoveSymbol() {
    this.removeSymbol.emit();
  }

  onChangeSymbol() {
    const [s1] = getRandomElement(STOCK_SYMBOLS, 1);
    this.form.patchValue({ symbol: s1 });
  }

  async onChangeHistoricalData() {
    const [s1] = getRandomElement(STOCK_SYMBOLS, 1);

    // set loading state
    this.loadingSymbolData.set(true);

    // get historical data for the symbol
    const historicalData = (
      await firstValueFrom(
        this.marketApiService.getHistoricalPrices(s1, SymbolHistoricalPeriods.year).pipe(catchError(() => of([]))),
      )
    ).map((d) => ({ date: d.date, price: d.close }));

    // set the form data
    this.form.patchValue({ historicalData });

    // remove loading state
    this.loadingSymbolData.set(false);
  }

  writeValue(obj: TradingSimulatorSymbol): void {
    console.log('writeValue', obj);
  }

  registerOnChange(fn: TradingSimulatorFormSymbolComponent['onChange']): void {
    this.onChange = fn;
  }

  /**
   * Register Component's ControlValueAccessor onTouched callback
   */
  registerOnTouched(fn: TradingSimulatorFormSymbolComponent['onTouched']): void {
    this.onTouched = fn;
  }

  /**
   * generate data into the form, when the component is initialized
   * use 2 random symbols - one for the symbol and one for the historical data
   */
  private async fillFormData(): Promise<void> {
    this.onChangeSymbol();
    this.onChangeHistoricalData();
  }
}
