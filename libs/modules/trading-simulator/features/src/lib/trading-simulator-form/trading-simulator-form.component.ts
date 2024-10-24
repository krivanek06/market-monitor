import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { TradingSimulatorApiService } from '@mm/api-client';
import { TRADING_SIMULATOR_MAX_ROUNDS, TradingSimulator } from '@mm/api-types';
import {
  intervalValidator,
  maxLengthValidator,
  minLengthValidator,
  positiveNumberValidator,
  requiredValidator,
} from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { generateRandomString, getCurrentDateDefaultFormat } from '@mm/shared/general-util';
import {
  DatePickerComponent,
  DateReadablePipe,
  FormMatInputWrapperComponent,
  GeneralCardComponent,
  InputTypeDateTimePickerConfig,
  LargeNumberFormatterPipe,
  SectionTitleComponent,
  SliderControlComponent,
  SliderControlConfig,
  TruncatePipe,
} from '@mm/shared/ui';
import { TradingSimulatorInfoButtonComponent } from '@mm/trading-simulator/ui';
import { addSeconds } from 'date-fns';
import { map, startWith } from 'rxjs';
import {
  TradingSimulatorFormData,
  TradingSimulatorFormSymbolComponent,
} from './trading-simulator-form-symbol/trading-simulator-form-symbol.component';

@Component({
  selector: 'app-trading-simulator-form',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    FormsModule,
    FormMatInputWrapperComponent,
    DatePickerComponent,
    MatCheckboxModule,
    SectionTitleComponent,
    MatDivider,
    MatButtonModule,
    MatIconModule,
    SliderControlComponent,
    DatePipe,
    LargeNumberFormatterPipe,
    GeneralCardComponent,
    DateReadablePipe,
    TruncatePipe,
    TradingSimulatorInfoButtonComponent,
    TradingSimulatorFormSymbolComponent,
  ],
  template: `
    <div class="grid grid-cols-3 gap-x-10">
      <!-- left side - form -->
      <form class="col-span-2 grid" [formGroup]="form">
        <!-- basic information -->
        <app-section-title
          title="Basic Information"
          description="Basic information about the trading simulator"
          titleSize="base"
          class="mb-4"
        >
          <app-trading-simulator-info-button class="w-[160px]" />
        </app-section-title>

        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          <!-- name -->
          <app-form-mat-input-wrapper inputCaption="name" [formControl]="form.controls.name" />

          <!-- start time -->
          <app-date-picker
            [inputTypeDateTimePickerConfig]="startTimeConfig"
            [formControl]="form.controls.startTime"
            type="datetime"
            [hasError]="form.controls.startTime.touched && form.controls.startTime.invalid"
          />

          <!-- maximum round -->
          <app-form-mat-input-wrapper
            inputCaption="maximum rounds"
            hintText="Rounds to play the simulator from 1 to {{ constFields.maxRounds }}"
            inputType="NUMBER"
            [formControl]="form.controls.maximumRounds"
          />

          <!-- round interval -->
          <app-form-mat-input-wrapper
            inputCaption="round interval"
            hintText="On round interval in seconds, from {{ constFields.roundIntervalSecondsMin }} to {{
              constFields.roundIntervalSecondsMax
            }}"
            inputType="NUMBER"
            [formControl]="form.controls.roundIntervalSeconds"
          />

          <!-- starting cash -->
          <app-form-mat-input-wrapper
            inputCaption="starting cash"
            hintText="Starting cash for each user in the simulator"
            [formControl]="form.controls.startingCash"
          />

          <!-- invitation code -->
          <app-form-mat-input-wrapper
            inputCaption="invitation code"
            hintText="Code to join the simulator"
            [formControl]="form.controls.invitationCode"
          />
        </div>

        <!-- divider -->
        <div class="my-3">
          <mat-divider />
        </div>

        <!-- margin trading -->
        <app-section-title
          title="Margin trading"
          description="Setup margin trading for this simulator"
          titleSize="base"
          class="mb-4"
        >
          <mat-checkbox [formControl]="form.controls.marginTradingEnabled" color="primary">
            Margin Trading
          </mat-checkbox>
        </app-section-title>

        <!-- margin trading form -->
        <div class="flex gap-4 *:flex-1">
          <!-- subtract period days -->
          <app-form-mat-input-wrapper
            inputCaption="Subtract period days"
            inputType="NUMBER"
            [formControl]="form.controls.marginTrading.controls.subtractPeriodDays"
          />

          <!-- subtract interest rate -->
          <app-form-mat-input-wrapper
            inputCaption="Subtract interest rate"
            inputType="NUMBER"
            [formControl]="form.controls.marginTrading.controls.subtractInterestRate"
          />

          <!-- margin conversion rate -->
          <app-form-mat-input-wrapper
            inputCaption="Margin conversion rate"
            inputType="NUMBER"
            [formControl]="form.controls.marginTrading.controls.marginConversionRate"
          />
        </div>

        <!-- divider -->
        <div class="my-3">
          <mat-divider />
        </div>

        <!-- issued cash -->
        <app-section-title
          title="Issued Cash"
          description="Setup additional cash issuing for participating users"
          titleSize="base"
          class="mb-4"
        >
          <mat-checkbox [formControl]="form.controls.cashIssuedEnabled" color="primary">Issue Cash</mat-checkbox>
        </app-section-title>

        <!-- issued cash form -->
        <div class="mb-4 grid">
          @for (formGroup of form.controls.cashIssued.controls; track $index; let i = $index) {
            <div class="flex gap-4" [formGroup]="formGroup">
              <!-- period issue -->
              <app-slider-control
                class="flex-1"
                inputCaption="Issue on round"
                [config]="sliderControlConfig()"
                [formControl]="formGroup.controls.issuedOnRound"
              />

              <!-- cash issued -->
              <app-form-mat-input-wrapper
                class="flex-1"
                inputCaption="Issue cash"
                inputType="NUMBER"
                [formControl]="formGroup.controls.value"
              />

              <!-- delete -->
              <button
                mat-icon-button
                (click)="onRemoveIssuedCash(i)"
                color="warn"
                [disabled]="!form.controls.cashIssuedEnabled.value"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          }
        </div>

        <!-- add issued cash -->
        <div class="flex justify-end">
          <button
            mat-stroked-button
            color="primary"
            (click)="onAddIssuedCash()"
            [disabled]="!form.controls.cashIssuedEnabled.value"
          >
            <mat-icon>add</mat-icon>
            add cash
          </button>
        </div>

        <!-- divider -->
        <div class="my-5">
          <mat-divider />
        </div>

        <!-- market change -->
        <app-section-title
          title="Market change"
          description="Setup market change that will influence the price of each symbol"
          titleSize="base"
          class="mb-4"
        >
          <mat-checkbox [formControl]="form.controls.marketChangeEnabled" color="primary">Market Change</mat-checkbox>
        </app-section-title>

        <!-- market change form -->
        <div class="mb-4 grid">
          @for (formGroup of form.controls.marketChange.controls; track $index; let i = $index) {
            <div class="flex gap-4" [formGroup]="formGroup">
              <!-- starting round -->
              <app-slider-control
                class="flex-1"
                inputCaption="Start on round"
                [config]="sliderControlConfig()"
                [formControl]="formGroup.controls.startingRound"
              />

              <!-- ending round -->
              <app-slider-control
                class="flex-1"
                inputCaption="End on round"
                [config]="sliderControlConfig()"
                [formControl]="formGroup.controls.endingRound"
              />

              <!-- value change -->
              <app-form-mat-input-wrapper
                class="flex-1"
                inputCaption="Value change"
                inputType="NUMBER"
                [formControl]="formGroup.controls.valueChange"
              />

              <!-- delete -->
              <button
                mat-icon-button
                (click)="onRemoveMarketChange(i)"
                color="warn"
                [disabled]="!form.controls.marketChangeEnabled.value"
              >
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          }
        </div>

        <!-- add market change -->
        <div class="flex justify-end">
          <button
            mat-stroked-button
            color="primary"
            (click)="onAddMarketChange()"
            [disabled]="!form.controls.marketChangeEnabled.value"
          >
            <mat-icon>add</mat-icon>
            add market change
          </button>
        </div>
      </form>

      <!-- right side - explanation -->
      <div class="flex flex-col gap-3 pt-4">
        <!-- basic information -->
        <app-general-card title="Basic Information">
          <div class="g-item-wrapper">
            <span>Name</span>
            <span>{{ formData().name | truncate: 25 }}</span>
          </div>

          <div class="g-item-wrapper">
            <span>Start Date</span>
            <span>{{ formData().startTime | date: 'HH:mm, dd. MMMM' }}</span>
          </div>

          <div class="g-item-wrapper">
            <span>End Date</span>
            <span>{{ formData().endTime | date: 'HH:mm, dd. MMMM' }}</span>
          </div>

          <div class="g-item-wrapper">
            <span>Total time</span>
            <span>{{ formData().totalTimeSeconds | dateReadable: 'seconds' }}</span>
          </div>

          <div class="g-item-wrapper">
            <span>Maximum rounds</span>
            <span>{{ formData().maximumRounds }}</span>
          </div>

          <div class="g-item-wrapper">
            <span>Round interval (sec)</span>
            <span>{{ formData().roundIntervalSeconds }}</span>
          </div>

          <div class="g-item-wrapper">
            <span>Starting cash</span>
            <span>{{ formData().startingCash | largeNumberFormatter: false : true }}</span>
          </div>

          <div class="g-item-wrapper">
            <span>Invitation code</span>
            <span>{{ formData().invitationCode }}</span>
          </div>
        </app-general-card>

        <!-- margin trading -->
        <app-general-card title="Margin Trading">
          @if (formData().marginTradingEnabled) {
            <div class="g-item-wrapper">
              <span>Subtract period</span>
              <span>{{ formData().marginTrading?.subtractPeriodDays }}</span>
            </div>

            <div class="g-item-wrapper">
              <span>Interest rate</span>
              <span>{{ formData().marginTrading?.subtractInterestRate }}</span>
            </div>

            <div class="g-item-wrapper">
              <span>Margin Rate</span>
              <span>{{ formData().marginTrading?.marginConversionRate }}:1</span>
            </div>
          } @else {
            <div class="p-2 text-center">Margin trading disabled</div>
          }
        </app-general-card>

        <!-- issued cash -->
        <app-general-card title="Issued Cash">
          <div class="grid grid-cols-2 gap-y-2">
            <div class="text-wt-gray-dark">Selected day</div>
            <div class="text-wt-gray-dark">Issued value</div>
            @if (formData().cashIssuedEnabled) {
              @for (item of formData().cashIssued; track $index) {
                <div>{{ item.issuedOnRound }}</div>
                <div>{{ item.value }}</div>
              } @empty {
                <div class="col-span-2 p-2 text-center">No issued cash</div>
              }
            } @else {
              <div class="col-span-2 p-2 text-center">Cash issuing disabled</div>
            }
          </div>
        </app-general-card>

        <!-- submit button -->
        <button type="button" mat-flat-button color="primary" (click)="onSubmit()" class="w-full">Submit</button>
      </div>
    </div>

    <!-- divider -->
    <div class="my-6">
      <mat-divider />
    </div>

    <!-- symbol select -->
    <app-section-title
      title="Select Symbols"
      description="Select what symbols are available in the trading simulator"
      titleSize="base"
      class="mb-4"
    />

    <!-- symbols form -->
    <div class="mb-10 grid gap-6">
      @for (control of form.controls.symbolsHistoricalData.controls; track control.value.symbol; let i = $index) {
        <app-trading-simulator-form-symbol
          [formControl]="control"
          [maximumRounds]="form.controls.maximumRounds.value"
          [marketChange]="form.controls.marketChange.value"
          (removeSymbol)="onRemoveSymbol(i)"
          [disabledRemove]="form.controls.symbolsHistoricalData.controls.length <= 5"
        />
        <mat-divider />
      }
    </div>

    <!-- symbols form add button -->
    <div class="flex justify-end">
      <button mat-stroked-button color="primary" (click)="onAddSymbol()">
        <mat-icon>add</mat-icon>
        add symbol
      </button>
    </div>
  `,
  styles: `
    :host {
      display: block;
      max-width: 1180px;
      margin: 0 auto;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingSimulatorFormComponent {
  private readonly tradingSimulatorApiService = inject(TradingSimulatorApiService);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);

  readonly constFields = {
    maxRounds: TRADING_SIMULATOR_MAX_ROUNDS,
    roundIntervalSecondsMin: 10,
    roundIntervalSecondsMax: 3600,
  } as const;

  /**
   * provide an existing trading simulator to edit it
   */
  readonly existingTradingSimulator = input<TradingSimulator | null>();

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [requiredValidator, maxLengthValidator(50), minLengthValidator(6)],
    }),
    // when to start the trading simulator
    startTime: new FormControl<null | Date>(null, { nonNullable: true, validators: [requiredValidator] }),
    // how many rounds to play
    maximumRounds: new FormControl(100, {
      nonNullable: true,
      validators: [requiredValidator, positiveNumberValidator, intervalValidator(1, TRADING_SIMULATOR_MAX_ROUNDS)],
    }),
    // how much time to (in seconds) to wait between rounds
    roundIntervalSeconds: new FormControl(10, {
      nonNullable: true,
      validators: [requiredValidator, positiveNumberValidator, intervalValidator(10, 3600)],
    }),
    // code to join the trading simulator
    invitationCode: new FormControl(generateRandomString(6), { nonNullable: true, validators: [requiredValidator] }),
    // cash value user starts with
    startingCash: new FormControl(30_000, {
      nonNullable: true,
      validators: [requiredValidator, positiveNumberValidator],
    }),

    // cash issuing
    cashIssuedEnabled: new FormControl<boolean>(true, { nonNullable: true }),
    cashIssued: new FormArray<
      FormGroup<{
        /** how much cash to issue */
        value: FormControl<number>;
        /** on which date to issue cash value */
        issuedOnRound: FormControl<number>;
      }>
    >([]),

    // market change - crash or positive value
    marketChangeEnabled: new FormControl<boolean>(true, { nonNullable: true }),
    marketChange: new FormArray<
      FormGroup<{
        /** on which round to influence prices */
        startingRound: FormControl<number>;
        /** on which round to stop influencing prices */
        endingRound: FormControl<number>;
        /** how much in % to influence market */
        valueChange: FormControl<number>;
      }>
    >([]),

    // margin trading
    marginTradingEnabled: new FormControl<boolean>(true, { nonNullable: true }),
    marginTrading: new FormGroup({
      subtractPeriodDays: new FormControl(7, {
        validators: [requiredValidator, positiveNumberValidator],
        nonNullable: true,
      }),
      subtractInterestRate: new FormControl(4, {
        validators: [requiredValidator, positiveNumberValidator, intervalValidator(3, 15)],
        nonNullable: true,
      }),
      marginConversionRate: new FormControl(3, {
        validators: [requiredValidator, positiveNumberValidator],
        nonNullable: true,
      }),
    }),

    /** modify the return of symbols historical data - imitate market crashes, bubbles, etc. */
    returnChange: new FormArray<
      FormGroup<{
        from: FormControl<string>;
        to: FormControl<string>;
        returnChange: FormControl<number>;
      }>
    >([]),

    // symbols - start with some default symbols
    symbolsHistoricalData: new FormArray<FormControl<TradingSimulatorFormData>>([
      new FormControl({ symbol: '', historicalData: [] }, { nonNullable: true }),
      new FormControl({ symbol: '', historicalData: [] }, { nonNullable: true }),
      new FormControl({ symbol: '', historicalData: [] }, { nonNullable: true }),
      new FormControl({ symbol: '', historicalData: [] }, { nonNullable: true }),
      new FormControl({ symbol: '', historicalData: [] }, { nonNullable: true }),
    ]),
  });

  /** put form into signal, better for change detection */
  readonly formData = toSignal(
    this.form.valueChanges.pipe(
      startWith(this.form.value),
      map((data) => ({
        ...data,
        endTime: data.startTime
          ? addSeconds(data.startTime, (data.maximumRounds ?? 1) * (data.roundIntervalSeconds ?? 10))
          : null,
        totalTimeSeconds: (data.maximumRounds ?? 1) * (data.roundIntervalSeconds ?? 10),
      })),
    ),
    { requireSync: true },
  );

  /** prevent selecting dates in the past */
  readonly startTimeConfig: InputTypeDateTimePickerConfig = {
    minDate: getCurrentDateDefaultFormat(),
  };

  /** config into each slider, maximum value is the max rounds */
  readonly sliderControlConfig = toSignal(
    this.form.controls.maximumRounds.valueChanges.pipe(
      startWith(this.form.controls.maximumRounds.value),
      map(
        (maxRounds) =>
          ({
            min: 1,
            max: maxRounds,
            step: 1,
          }) satisfies SliderControlConfig,
      ),
    ),
    { requireSync: true },
  );

  constructor() {
    this.form.valueChanges.subscribe((res) => {
      console.log('create ', res);
    });

    // listen on margin trading enabled sate
    this.form.controls.marginTradingEnabled.valueChanges.pipe(takeUntilDestroyed()).subscribe((enabled) => {
      this.changeFormMarginTradingValidation(enabled);
    });

    // listen on cash issued enabled state
    this.form.controls.cashIssuedEnabled.valueChanges.pipe(takeUntilDestroyed()).subscribe((enabled) => {
      this.changeFormCashIssuedValidation(enabled);
    });

    // listen on market change enabled state
    this.form.controls.marketChangeEnabled.valueChanges.pipe(takeUntilDestroyed()).subscribe((enabled) => {
      this.changeFormMarketChangeValidation(enabled);
    });
  }

  onSubmit(): void {
    this.form.markAllAsTouched();
    console.log('form', this.form.value);

    // invalid form
    if (this.form.invalid) {
      this.dialogServiceUtil.showNotificationBar('Please fill in all required fields', 'error');
      return;
    }

    // update the existing trading simulator
    if (this.existingTradingSimulator()) {
      return;
    }

    // todo - create a new trading simulator
  }

  onAddSymbol(): void {
    // create form group for symbol
    const symbolForm: TradingSimulatorFormData = {
      symbol: '',
      historicalData: [],
    };

    // create control
    const control = new FormControl(symbolForm, { nonNullable: true });

    // add the form group to the form array
    this.form.controls.symbolsHistoricalData.push(control);
  }

  onRemoveSymbol(index: number): void {
    console.log('remove symbol', index);
    this.form.controls.symbolsHistoricalData.removeAt(index);
  }

  onAddMarketChange(): void {
    // create control
    const control = new FormGroup({
      startingRound: new FormControl<number>(1, {
        validators: [requiredValidator, positiveNumberValidator],
        nonNullable: true,
      }),
      endingRound: new FormControl<number>(1, {
        validators: [requiredValidator, positiveNumberValidator],
        nonNullable: true,
      }),
      valueChange: new FormControl<number>(10, {
        validators: [requiredValidator, intervalValidator(-100, 100)],
        nonNullable: true,
      }),
    });

    // add the form group to the form array
    this.form.controls.marketChange.push(control);
  }

  onRemoveMarketChange(index: number): void {
    // remove the form group from the form array
    this.form.controls.marketChange.removeAt(index);
  }

  onAddIssuedCash(): void {
    // create form group for issued cash
    const formIssuedCashGroup = new FormGroup({
      value: new FormControl<number>(1000, {
        validators: [requiredValidator, positiveNumberValidator, intervalValidator(0, 100_000)],
        nonNullable: true,
      }),
      issuedOnRound: new FormControl<number>(1, {
        validators: [requiredValidator, positiveNumberValidator],
        nonNullable: true,
      }),
    });

    // add the form group to the form array
    this.form.controls.cashIssued.push(formIssuedCashGroup);
  }

  onRemoveIssuedCash(index: number): void {
    // remove the form group from the form array
    this.form.controls.cashIssued.removeAt(index);
  }

  private changeFormMarketChangeValidation(enabled: boolean): void {
    if (enabled) {
      this.form.controls.marketChange.enable();
      this.form.controls.marketChange.controls.forEach((control) => {
        control.controls.startingRound.enable();
        control.controls.endingRound.enable();
        control.controls.valueChange.enable();
      });
    } else {
      this.form.controls.marketChange.disable();
      this.form.controls.marketChange.controls.forEach((control) => {
        // reset to default values
        control.controls.startingRound.patchValue(1);
        control.controls.endingRound.patchValue(1);
        control.controls.valueChange.patchValue(10);
        // disable the form group
        control.controls.startingRound.disable();
        control.controls.endingRound.disable();
        control.controls.valueChange.disable();
      });
    }

    // update form validation
    this.form.controls.marketChange.updateValueAndValidity();
  }

  private changeFormCashIssuedValidation(enabled: boolean): void {
    if (enabled) {
      this.form.controls.cashIssued.enable();
      this.form.controls.cashIssued.controls.forEach((control) => {
        control.controls.value.enable();
        control.controls.issuedOnRound.enable();
      });
    } else {
      this.form.controls.cashIssued.disable();
      this.form.controls.cashIssued.controls.forEach((control) => {
        // reset to default values
        control.controls.value.patchValue(1000);
        control.controls.issuedOnRound.patchValue(1);
        // disable the form group
        control.controls.value.disable();
        control.controls.issuedOnRound.disable();
      });
    }

    // update form validation
    this.form.controls.cashIssued.updateValueAndValidity();
  }

  private changeFormMarginTradingValidation(enabled: boolean): void {
    if (enabled) {
      this.form.controls.marginTrading.controls.subtractPeriodDays.enable();
      this.form.controls.marginTrading.controls.subtractPeriodDays.setValidators([
        requiredValidator,
        positiveNumberValidator,
      ]);

      this.form.controls.marginTrading.controls.subtractInterestRate.enable();
      this.form.controls.marginTrading.controls.subtractInterestRate.setValidators([
        requiredValidator,
        positiveNumberValidator,
        intervalValidator(3, 15),
      ]);

      this.form.controls.marginTrading.controls.marginConversionRate.enable();
      this.form.controls.marginTrading.controls.marginConversionRate.setValidators([
        requiredValidator,
        positiveNumberValidator,
      ]);
    } else {
      this.form.controls.marginTrading.controls.subtractPeriodDays.disable();
      this.form.controls.marginTrading.controls.subtractPeriodDays.clearValidators();

      this.form.controls.marginTrading.controls.subtractInterestRate.disable();
      this.form.controls.marginTrading.controls.subtractInterestRate.clearValidators();

      this.form.controls.marginTrading.controls.marginConversionRate.disable();
      this.form.controls.marginTrading.controls.marginConversionRate.clearValidators();
    }

    // update form validation
    this.form.controls.marginTrading.controls.subtractPeriodDays.updateValueAndValidity();
    this.form.controls.marginTrading.controls.subtractInterestRate.updateValueAndValidity();
    this.form.controls.marginTrading.controls.marginConversionRate.updateValueAndValidity();
  }
}
