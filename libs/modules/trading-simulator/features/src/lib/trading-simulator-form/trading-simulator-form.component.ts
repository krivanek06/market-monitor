import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { MarketApiService, TradingSimulatorApiService } from '@mm/api-client';
import { TradingSimulator } from '@mm/api-types';
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
  FormMatInputWrapperComponent,
  InputTypeDateTimePickerConfig,
  SectionTitleComponent,
} from '@mm/shared/ui';

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
  ],
  template: `
    <section class="mx-auto max-w-[1180px]">
      <div class="mb-10">title</div>

      <div class="flex gap-x-10">
        <!-- left side - form -->
        <form class="grid basis-3/4 gap-y-2" [formGroup]="form">
          <!-- basic information -->
          <app-section-title
            title="Basic Information"
            description="Basic information about the trading simulator"
            titleSize="base"
            class="mb-2"
          />

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
            class="mb-2"
          >
            <mat-checkbox [formControl]="form.controls.cashIssuedEnabled" color="primary">Issue Cash</mat-checkbox>
          </app-section-title>

          <!-- issued cash form -->
          <div class="mb-4 grid gap-y-2">
            @for (control of form.controls.cashIssued.controls; track $index; let i = $index) {
              <div class="flex gap-4" [formGroup]="control">
                @let usedControl = form.controls.cashIssued.controls[i].controls;
                <!-- date issue -->
                <app-date-picker
                  class="flex-1"
                  type="date"
                  [inputTypeDateTimePickerConfig]="startTimeConfig"
                  [formControl]="usedControl.date"
                  [hasError]="usedControl.date.touched && usedControl.date.invalid"
                />

                <!-- cash issued -->
                <app-form-mat-input-wrapper
                  class="flex-1"
                  inputCaption="Issue cash"
                  inputType="NUMBER"
                  [formControl]="usedControl.value"
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
            class="mb-2"
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
        <div class="basis-1/4">
          TODO

          <button type="button" mat-flat-button color="primary" (click)="onSubmit()">Submit</button>
        </div>
      </div>

      <!-- divider -->
      <div class="my-6">
        <mat-divider />
      </div>

      <!-- margin trading -->
      <app-section-title
        title="Select Symbols"
        description="Select what symbols are available in the trading simulator"
        titleSize="base"
        class="mb-2"
      />

      TODO - have prepared 4-5 symbols with changed data
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
  private readonly marketApiService = inject(MarketApiService);
  private readonly tradingSimulatorApiService = inject(TradingSimulatorApiService);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);

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
      validators: [requiredValidator, positiveNumberValidator],
    }),
    // how much time to (in seconds) to wait between rounds
    roundIntervalSeconds: new FormControl(30, {
      nonNullable: true,
      validators: [requiredValidator, positiveNumberValidator],
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
        date: FormControl<string | null>;
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
    symbols: new FormArray<
      FormGroup<{
        symbol: FormControl<string>;
        /** original historical data pulled from the internet */
        historicalData: FormControl<{ date: string; price: number }[]>;
        /** modified historical displayed in charts */
        historicalDataModified: FormControl<{ date: string; price: number }[]>;
        unitsAvailableOnStart: FormControl<number>;
        unitsInfinity: FormControl<boolean>;
        /** possible to issue more shares of a specific symbol */
        unitsAdditionalIssued: FormControl<
          {
            date: string;
            value: number;
          }[]
        >;
        /** possible to multiply every historical value by N times */
        priceMultiplication: FormControl<number>;
      }>
    >([]),
  });

  /** prevent selecting dates in the past */
  readonly startTimeConfig: InputTypeDateTimePickerConfig = {
    minDate: getCurrentDateDefaultFormat(),
  };

  constructor() {
    this.form.controls.name.statusChanges.subscribe(console.log);
    this.form.valueChanges.subscribe((res) => {
      console.log('create ', res);
    });

    // this.form.controls.name.disable();
    // this.form.controls.startTime.disable();

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

  async onAddSymbol(): Promise<void> {
    // get historical prices for a symbol
    const historicalPrices = await this.generateHistoricalPrices();

    // todo - get random symbol

    // create form group for a symbol
    const formSymbolGroup = new FormGroup({
      symbol: new FormControl('', { validators: [requiredValidator, maxLengthValidator(10)], nonNullable: true }),
      unitsAvailableOnStart: new FormControl(1_000, {
        validators: [requiredValidator, positiveNumberValidator],
        nonNullable: true,
      }),
      unitsInfinity: new FormControl(false, { validators: [requiredValidator], nonNullable: true }),
      historicalData: new FormControl(historicalPrices, { validators: [requiredValidator], nonNullable: true }),
      historicalDataModified: new FormControl(historicalPrices, { validators: [requiredValidator], nonNullable: true }),
      priceMultiplication: new FormControl(1, {
        validators: [requiredValidator, positiveNumberValidator],
        nonNullable: true,
      }),
      unitsAdditionalIssued: new FormControl<
        {
          date: string;
          value: number;
        }[]
      >([], { nonNullable: true }),
    });

    // add the form group to the form array
    this.form.controls.symbols.push(formSymbolGroup);
  }

  onGenerateNewDataForSymbol(symbol: string, index: number): void {
    // todo
  }

  onRemoveSymbol(index: number): void {
    this.form.controls.symbols.removeAt(index);
  }

  onAddIssuedCash(): void {
    // create form group for issued cash
    const formIssuedCashGroup = new FormGroup({
      value: new FormControl<number>(1000, {
        validators: [requiredValidator, positiveNumberValidator, intervalValidator(0, 100_000)],
        nonNullable: true,
      }),
      date: new FormControl<string | null>(null, { validators: [requiredValidator], nonNullable: true }),
    });

    // add the form group to the form array
    this.form.controls.cashIssued.push(formIssuedCashGroup);
  }

  onRemoveIssuedCash(index: number): void {
    // // remove validation for the form group
    // this.form.controls.cashIssued.controls[index].controls.value.clearValidators();
    // this.form.controls.cashIssued.controls[index].controls.date.clearValidators();

    // // update the form group validation
    // this.form.controls.cashIssued.controls[index].updateValueAndValidity();

    // remove the form group from the form array
    this.form.controls.cashIssued.removeAt(index);
  }

  /**
   *
   * @returns historical prices for a symbol
   */
  private async generateHistoricalPrices(): Promise<{ date: string; price: number }[]> {
    // todo: implement this
    // todo - probably I should pull some historical prices so that students can analyze the chart
    // todo - and not just random data
    return [];
  }

  private changeFormCashIssuedValidation(enabled: boolean): void {
    if (enabled) {
      this.form.controls.cashIssued.enable();
      this.form.controls.cashIssued.controls.forEach((control) => {
        control.controls.value.enable();
        control.controls.date.enable();
      });
    } else {
      this.form.controls.cashIssued.disable();
      this.form.controls.cashIssued.controls.forEach((control) => {
        control.controls.value.disable();
        control.controls.date.disable();
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
