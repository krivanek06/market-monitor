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
import { addSeconds } from 'date-fns';
import { map, startWith } from 'rxjs';
import { TradingSimulatorFormSummaryComponent } from './trading-simulator-form-summary/trading-simulator-form-summary.component';
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
    TradingSimulatorFormSymbolComponent,
    TradingSimulatorFormSummaryComponent,
  ],
  template: `
    <section class="mx-auto max-w-[1180px]">
      <div class="mb-10 flex items-center justify-between">
        <div class="text-wt-primary text-xl">Trading Simulator Form</div>

        <!-- info button -->
        <button mat-stroked-button>TODO INFO</button>
      </div>

      <div class="grid grid-cols-3 gap-x-10">
        <!-- left side - form -->
        <form class="col-span-2 grid gap-y-2" [formGroup]="form">
          <!-- basic information -->
          <app-section-title
            title="Basic Information"
            description="Basic information about the trading simulator"
            titleSize="base"
            class="mb-4"
          >
            <!-- submit button -->
            <button type="button" mat-flat-button color="primary" (click)="onSubmit()">Submit</button>
          </app-section-title>

          <div class="grid grid-cols-2 gap-x-6 gap-y-4">
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
              inputType="NUMBER"
              [formControl]="form.controls.maximumRounds"
            />

            <!-- round interval -->
            <app-form-mat-input-wrapper
              inputCaption="round interval"
              hintText="How long in seconds one round takes"
              inputType="NUMBER"
              [formControl]="form.controls.roundIntervalSeconds"
            />

            <!-- invitation code -->
            <app-form-mat-input-wrapper inputCaption="invitation code" [formControl]="form.controls.invitationCode" />

            <!-- starting cash -->
            <app-form-mat-input-wrapper inputCaption="starting cash" [formControl]="form.controls.startingCash" />
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
          <div class="mb-4 grid gap-y-2">
            @for (formGroup of form.controls.cashIssued.controls; track $index; let i = $index) {
              <div class="flex gap-4" [formGroup]="formGroup">
                <!-- date issue -->
                <app-slider-control
                  class="flex-1"
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
        </form>

        <!-- right side - explanation -->
        <div class="flex min-h-[750px] flex-col gap-3 pt-4">
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
              <span>Invitation code</span>
              <span>{{ formData().invitationCode }}</span>
            </div>

            <div class="g-item-wrapper">
              <span>Starting cash</span>
              <span>{{ formData().startingCash | largeNumberFormatter: false : true }}</span>
            </div>
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

          <!-- margin trading -->
          <app-general-card title="Basic Information">
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
        @for (control of form.controls.symbolsHistoricalData.controls; track $index; let i = $index) {
          <app-trading-simulator-form-symbol
            [formControl]="control"
            [maximumRounds]="form.controls.maximumRounds.value"
            (removeSymbol)="onRemoveSymbol(i)"
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
    </section>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingSimulatorFormComponent {
  private readonly tradingSimulatorApiService = inject(TradingSimulatorApiService);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);

  // todo - add market crash settings
  // todo - add more hints to fields

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

    // symbols
    symbolsHistoricalData: new FormArray<FormControl<TradingSimulatorFormData>>([]),
  });

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
    this.form.controls.symbolsHistoricalData.removeAt(index);
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
