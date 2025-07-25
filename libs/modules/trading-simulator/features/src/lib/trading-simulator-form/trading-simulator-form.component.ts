import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject, input } from '@angular/core';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDivider } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { TRADING_SIMULATOR_MAX_ROUNDS, TradingSimulator, TradingSimulatorSymbol } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import {
  dateTimeInFuture,
  InputSource,
  intervalValidator,
  maxLengthValidator,
  minLengthValidator,
  positiveNumberValidator,
  requiredValidator,
  ROUTES_MAIN,
  ROUTES_TRADING_SIMULATOR,
} from '@mm/shared/data-access';
import { Confirmable, DialogServiceUtil } from '@mm/shared/dialog-manager';
import {
  createUUID,
  generateRandomString,
  getCurrentDateAndTimeRoundedTo,
  getCurrentDateDefaultFormat,
  getCurrentDateDetailsFormat,
} from '@mm/shared/general-util';
import {
  DatePickerComponent,
  DateReadablePipe,
  DropdownControlComponent,
  FormMatInputWrapperComponent,
  GeneralCardComponent,
  InputTypeDateTimePickerConfig,
  LargeNumberFormatterPipe,
  SectionTitleComponent,
  SliderControlComponent,
  SliderControlConfig,
  TruncatePipe,
} from '@mm/shared/ui';
import { TradingSimulatorService } from '@mm/trading-simulator/data-access';
import { TradingSimulatorInfoCreateButtonComponent } from '@mm/trading-simulator/ui';
import { addMinutes } from 'date-fns';
import { effectOnceIf } from 'ngxtension/effect-once-if';
import { map, startWith } from 'rxjs';
import { TradingSimulatorFormSymbolComponent } from './trading-simulator-form-symbol/trading-simulator-form-symbol.component';

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
    TradingSimulatorInfoCreateButtonComponent,
    TradingSimulatorFormSymbolComponent,
    DropdownControlComponent,
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
          <app-trading-simulator-info-create-button class="w-[160px]" />
        </app-section-title>

        <div class="grid grid-cols-2 gap-x-6 gap-y-2">
          <!-- name -->
          <app-form-mat-input-wrapper inputCaption="name" [formControl]="form.controls.name" />

          <!-- start time -->
          <div>
            @let invalid = form.controls.startTime.touched && form.controls.startTime.invalid;
            <app-date-picker
              [inputTypeDateTimePickerConfig]="startTimeConfig"
              [formControl]="form.controls.startTime"
              type="datetime"
              roundToNear="10_MINUTES"
              [hasError]="invalid"
            />
            @if (invalid) {
              <div class="text-wt-danger pl-2 text-xs">Date must be in the future</div>
            }
          </div>

          <!-- maximum round -->
          <app-form-mat-input-wrapper
            inputCaption="maximum rounds"
            hintText="Rounds to play the simulator from 1 to {{ constFields.maxRounds }}"
            inputType="NUMBER"
            [formControl]="form.controls.maximumRounds"
          />

          <!-- round interval -->
          <app-dropdown-control
            inputCaption="round interval"
            hintText="On round interval in minuted, from {{ constFields.roundIntervalMin }} to {{
              constFields.roundIntervalMax
            }}"
            [inputSource]="tradingSimulatorRoundIntervalInputSource"
            [formControl]="form.controls.roundIntervalMin"
          />

          <!-- starting cash -->
          <app-form-mat-input-wrapper
            inputCaption="starting cash"
            hintText="Starting cash for each user in the simulator"
            inputType="NUMBER"
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
        @if (false) {
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
              [formControl]="form.controls.marginTrading.controls.subtractPeriodRounds"
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
        }

        <!-- issued cash -->
        <app-section-title
          title="Issued Cash"
          description="Setup additional cash issuing for participating users"
          titleSize="base"
          class="mb-4"
        >
          <!-- add issued cash -->
          <button mat-stroked-button color="primary" (click)="onAddIssuedCash()">
            <mat-icon>add</mat-icon>
            add cash
          </button>
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
              <button mat-icon-button (click)="onRemoveIssuedCash(i)" color="warn">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          }
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
          <!-- add market change -->
          <button mat-stroked-button color="primary" (click)="onAddMarketChange()">
            <mat-icon>add</mat-icon>
            add market change
          </button>
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
              <button mat-icon-button (click)="onRemoveMarketChange(i)" color="warn">
                <mat-icon>delete</mat-icon>
              </button>
            </div>
          }
        </div>
      </form>

      <!-- right side - explanation -->
      <div class="flex flex-col gap-3 pt-4">
        <!-- not live warning -->
        @if (existingTradingSimulator()?.simulator?.state === 'draft') {
          <div class="rounded-md bg-gray-700 p-4 text-center text-yellow-600">
            This simulator is not live. It will not be visible to other users.
          </div>
        }

        <!-- basic information -->
        <app-general-card title="Basic Information">
          @if (existingTradingSimulator()) {
            <div class="g-item-wrapper">
              <span>ID</span>
              <span>{{ existingTradingSimulator()?.simulator?.id }}</span>
            </div>
          }

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
            <span>{{ formData().totalTimeMinutes | dateReadable: 'minutes' }}</span>
          </div>

          <div class="g-item-wrapper">
            <span>Maximum rounds</span>
            <span>{{ formData().maximumRounds }}</span>
          </div>

          <div class="g-item-wrapper">
            <span>Round interval (sec)</span>
            <span>{{ formData().roundIntervalMin }}</span>
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
        @if (false) {
          <app-general-card title="Margin Trading">
            @if (formData().marginTradingEnabled) {
              <div class="g-item-wrapper">
                <span>Subtract period</span>
                <span>{{ formData().marginTrading?.subtractPeriodRounds }}</span>
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
        }

        <!-- issued cash -->
        <app-general-card title="Issued Cash">
          <div class="grid grid-cols-2 gap-y-2">
            <div class="text-wt-gray-dark">Selected day</div>
            <div class="text-wt-gray-dark">Issued value</div>
            @for (item of formData().cashIssued; track $index) {
              <div>{{ item.issuedOnRound }}</div>
              <div>{{ item.value }}</div>
            } @empty {
              <div class="col-span-2 p-2 text-center">No issued cash</div>
            }
          </div>
        </app-general-card>

        <!-- submit button -->
        <div class="flex flex-col gap-4 lg:flex-row">
          <button type="button" mat-flat-button (click)="onDraftSave()" class="w-full">Save as Draft</button>
          <button type="button" mat-stroked-button color="accent" (click)="onLiveSave()" class="w-full">GO Live</button>
        </div>
      </div>
    </div>

    <!-- divider -->
    <div class="my-6">
      <mat-divider />
    </div>

    <!-- symbol select -->
    <app-section-title
      title="Select Symbols"
      [description]="[
        'Select what symbols are available in the trading simulator.',
        'Keep in mind that these historical prices are random, they do not represent the actual price movement for the selected symbol.',
      ]"
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
          [disabledRemove]="form.controls.symbolsHistoricalData.controls.length <= 6"
          [alreadySelectedSymbol]="alreadySelectedSymbol()"
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
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TradingSimulatorFormComponent {
  private readonly tradingSimulatorService = inject(TradingSimulatorService);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private readonly dialogServiceUtil = inject(DialogServiceUtil);
  private readonly router = inject(Router);

  readonly constFields = {
    maxRounds: TRADING_SIMULATOR_MAX_ROUNDS,
    roundIntervalMin: 1,
    roundIntervalMax: 3600,
  } as const;

  readonly tradingSimulatorRoundIntervalInputSource = [
    {
      caption: '5 min',
      value: 5,
    },
    {
      caption: '10 min',
      value: 10,
    },
    {
      caption: '15 min',
      value: 15,
    },
    {
      caption: '20 min',
      value: 20,
    },
    {
      caption: '30 min',
      value: 30,
    },
    {
      caption: '1 hour',
      value: 60,
    },
    {
      caption: '2 hour',
      value: 120,
    },
  ] as const satisfies InputSource<number>[];

  /**
   * provide an existing trading simulator to edit it
   */
  readonly existingTradingSimulator = input<{
    simulator: TradingSimulator;
    simulatorSymbols: TradingSimulatorSymbol[];
  } | null>();

  readonly form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [requiredValidator, maxLengthValidator(24), minLengthValidator(6)],
    }),
    // when to start the trading simulator
    startTime: new FormControl<null | Date>(null, {
      nonNullable: true,
      validators: [requiredValidator, dateTimeInFuture],
    }),
    // how many rounds to play
    maximumRounds: new FormControl(100, {
      nonNullable: true,
      validators: [requiredValidator, positiveNumberValidator, intervalValidator(1, TRADING_SIMULATOR_MAX_ROUNDS)],
    }),
    // how much time to (in seconds) to wait between rounds
    roundIntervalMin: new FormControl(5, {
      nonNullable: true,
      validators: [requiredValidator, positiveNumberValidator],
    }),
    // code to join the trading simulator
    invitationCode: new FormControl(generateRandomString(6), {
      nonNullable: true,
      validators: [maxLengthValidator(20)],
    }),
    // cash value user starts with
    startingCash: new FormControl(30_000, {
      nonNullable: true,
      validators: [requiredValidator, positiveNumberValidator],
    }),

    // cash issuing
    cashIssued: new FormArray<
      FormGroup<{
        /** how much cash to issue */
        value: FormControl<number>;
        /** on which date to issue cash value */
        issuedOnRound: FormControl<number>;
      }>
    >([]),

    // market change - crash or positive value
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
    marginTradingEnabled: new FormControl<boolean>(false, { nonNullable: true }),
    marginTrading: new FormGroup({
      subtractPeriodRounds: new FormControl(7, {
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

    // symbols - start with some default symbols
    symbolsHistoricalData: new FormArray<FormControl<TradingSimulatorSymbol>>([]),
  });

  /** put form into signal, better for change detection */
  readonly formData = toSignal(
    this.form.valueChanges.pipe(
      startWith(this.form.value),
      map((data) => ({
        ...data,
        endTime: data.startTime
          ? addMinutes(data.startTime, (data.maximumRounds ?? 1) * (data.roundIntervalMin ?? 10))
          : null,
        totalTimeMinutes: (data.maximumRounds ?? 1) * (data.roundIntervalMin ?? 10),
      })),
    ),
    { requireSync: true },
  );

  /**
   * keep track of already selected symbols to prevent duplicates
   */
  readonly alreadySelectedSymbol = toSignal(
    this.form.controls.symbolsHistoricalData.valueChanges.pipe(map((symbols) => symbols.map((d) => d.symbol))),
    {
      initialValue: [],
    },
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

  // check if we have existing trading simulator
  readonly existingSimulatorEffect = effectOnceIf(
    () => this.existingTradingSimulator(),
    (existing) => {
      this.patchValuesToTheForm(existing);
    },
  );

  constructor() {
    this.form.valueChanges.subscribe((res) => {
      console.log('form change ', res);
    });

    // listen on margin trading enabled sate
    this.form.controls.marginTradingEnabled.valueChanges
      .pipe(startWith(this.form.controls.marginTradingEnabled.value), takeUntilDestroyed())
      .subscribe((enabled) => {
        this.changeFormMarginTradingValidation(enabled);
      });

    // add symbols
    this.onAddSymbol(undefined, 'AAPL');
    this.onAddSymbol(undefined, 'MSFT');
    this.onAddSymbol(undefined, 'GOOGL');
    this.onAddSymbol(undefined, 'AMZN');
    this.onAddSymbol(undefined, 'TSLA');
    this.onAddSymbol(undefined, 'META');
  }

  @Confirmable(
    'Confirm saving the draft state. Simulator will not be visible to other users, you can still edit the simulator',
  )
  onDraftSave(): void {
    this.onSubmit('draft');
  }

  @Confirmable('Confirm going live with the simulator. Simulator will be visible to other users')
  onLiveSave(): void {
    this.onSubmit('live');
  }

  /**
   *
   * @param data - symbol data already stored (used in editing)
   * @param symbol - add a random symbol to the form
   * @returns
   */
  onAddSymbol(data?: TradingSimulatorSymbol, symbol = ''): void {
    // prevent adding more than 10 symbols
    if (this.form.controls.symbolsHistoricalData.controls.length >= 10) {
      this.dialogServiceUtil.showNotificationBar('You can add up to 10 symbols', 'error');
      return;
    }

    // create form group for symbol
    const symbolForm: TradingSimulatorSymbol = {
      symbol: data?.symbol ?? symbol,
      priceMultiplication: data?.priceMultiplication ?? 1,
      unitsAvailableOnStart: data?.unitsAvailableOnStart ?? 0,
      unitsAdditionalIssued: data?.unitsAdditionalIssued ?? [],
      historicalDataModified: data?.historicalDataModified ?? [],
      historicalDataOriginal: data?.historicalDataOriginal ?? [],
      unitsInfinity: data?.unitsInfinity ?? true,
    };

    // create control
    const control = new FormControl(symbolForm, { nonNullable: true });

    // add the form group to the form array
    this.form.controls.symbolsHistoricalData.push(control);
  }

  onRemoveSymbol(index: number): void {
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
    this.form.controls.cashIssued.removeAt(index);
  }

  private async onSubmit(state: 'live' | 'draft') {
    this.form.markAllAsTouched();
    const userData = this.authenticationUserStoreService.state.getUserData();

    // invalid form
    if (this.form.invalid) {
      this.dialogServiceUtil.showNotificationBar('Please fill in all required fields', 'error');
      return;
    }

    // check if user has access
    if (!userData.featureAccess?.createTradingSimulator) {
      this.dialogServiceUtil.showNotificationBar('You do not have access to create trading simulator', 'error');
      return;
    }

    const tradingSimulator = this.getTradingSimulatorFormData();
    const tradingSimulatorSymbol = this.getTradingSimulatorSymbolData();

    // notify user
    this.dialogServiceUtil.showNotificationBar(`Updating ${tradingSimulator.name} simulator`);

    try {
      const existingTradingSimulator = this.existingTradingSimulator();
      if (existingTradingSimulator) {
        // update trading simulator
        await this.tradingSimulatorService.updateTradingSimulatorPlay({
          tradingSimulator,
          tradingSimulatorSymbol,
          existingSimulator: existingTradingSimulator.simulator,
        });
      } else {
        // create trading simulator
        await this.tradingSimulatorService.createTradingSimulatorPlay({
          tradingSimulator,
          tradingSimulatorSymbol,
        });
      }

      // notify user
      this.dialogServiceUtil.showNotificationBar(`Trading simulator ${tradingSimulator.name} updated`, 'success');

      if (state === 'draft') {
        // route to trading simulator editing
        this.router.navigate([
          ROUTES_MAIN.APP,
          ROUTES_MAIN.TRADING_SIMULATOR,
          ROUTES_TRADING_SIMULATOR.EDIT,
          tradingSimulator.id,
        ]);
      } else {
        // change state
        this.tradingSimulatorService.simulatorStateChangeGoLive(tradingSimulator);
        // route to trading simulator
        this.router.navigate([ROUTES_MAIN.APP, ROUTES_MAIN.TRADING_SIMULATOR]);
      }
    } catch (error) {
      this.dialogServiceUtil.handleError(error);
    }
  }

  private getTradingSimulatorFormData(): TradingSimulator {
    const formData = this.form.getRawValue();
    const formDataMore = this.formData();

    const existing = this.existingTradingSimulator()?.simulator;

    const currentTimeRoundedTo10Minutes = getCurrentDateAndTimeRoundedTo('10_MINUTES');
    const user = this.authenticationUserStoreService.state.getUserDataMin();

    const result: TradingSimulator = {
      id: existing?.id ?? createUUID(),
      name: formData.name,
      createdDate: existing?.createdDate ?? getCurrentDateDetailsFormat(),
      updatedDate: getCurrentDateDetailsFormat(),
      invitationCode: formData.invitationCode,
      maximumRounds: formData.maximumRounds,
      oneRoundDurationMinutes: formData.roundIntervalMin,
      state: 'draft',
      startDateTime: formData.startTime?.toISOString() ?? currentTimeRoundedTo10Minutes,
      nextRoundTime: formData.startTime?.toISOString() ?? currentTimeRoundedTo10Minutes,
      endDateTime: formDataMore.endTime?.toISOString() ?? currentTimeRoundedTo10Minutes,
      totalTimeMinutes: formDataMore.totalTimeMinutes,
      symbolAvailable: formData.symbolsHistoricalData.length,
      symbols: formData.symbolsHistoricalData.map((d) => d.symbol),
      currentParticipants: 0,
      participants: [],
      cashStartingValue: formData.startingCash,
      cashAdditionalIssued: formData.cashIssued,
      marginTrading: formData.marginTradingEnabled ? formData.marginTrading : null,
      marketChange: formData.marketChange,
      owner: user,
      statisticsGenerated: false,
      currentRound: 0,
    };

    return result;
  }

  private getTradingSimulatorSymbolData(): TradingSimulatorSymbol[] {
    return this.form.getRawValue().symbolsHistoricalData.map(
      (d) =>
        ({
          symbol: d.symbol,
          unitsAvailableOnStart: d.unitsAvailableOnStart,
          unitsAdditionalIssued: d.unitsAdditionalIssued,
          historicalDataModified: d.historicalDataModified,
          historicalDataOriginal: d.historicalDataOriginal,
          priceMultiplication: d.priceMultiplication,
          unitsInfinity: d.unitsInfinity,
        }) satisfies TradingSimulatorSymbol,
    );
  }

  private changeFormMarginTradingValidation(enabled: boolean): void {
    if (enabled) {
      this.form.controls.marginTrading.controls.subtractPeriodRounds.enable();
      this.form.controls.marginTrading.controls.subtractPeriodRounds.setValidators([
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
      this.form.controls.marginTrading.controls.subtractPeriodRounds.disable();
      this.form.controls.marginTrading.controls.subtractPeriodRounds.clearValidators();

      this.form.controls.marginTrading.controls.subtractInterestRate.disable();
      this.form.controls.marginTrading.controls.subtractInterestRate.clearValidators();

      this.form.controls.marginTrading.controls.marginConversionRate.disable();
      this.form.controls.marginTrading.controls.marginConversionRate.clearValidators();
    }

    // update form validation
    this.form.controls.marginTrading.controls.subtractPeriodRounds.updateValueAndValidity();
    this.form.controls.marginTrading.controls.subtractInterestRate.updateValueAndValidity();
    this.form.controls.marginTrading.controls.marginConversionRate.updateValueAndValidity();
  }

  private patchValuesToTheForm(existing: {
    simulator: TradingSimulator;
    simulatorSymbols: TradingSimulatorSymbol[];
  }): void {
    this.form.patchValue(
      {
        name: existing.simulator.name,
        startTime: new Date(existing.simulator.startDateTime),
        maximumRounds: existing.simulator.maximumRounds,
        roundIntervalMin: existing.simulator.oneRoundDurationMinutes,
        startingCash: existing.simulator.cashStartingValue,
        invitationCode: existing.simulator.invitationCode,
        marginTradingEnabled: !!existing.simulator.marginTrading?.subtractPeriodRounds,
        marginTrading: {
          subtractPeriodRounds: existing.simulator.marginTrading?.subtractPeriodRounds,
          subtractInterestRate: existing.simulator.marginTrading?.subtractInterestRate,
          marginConversionRate: existing.simulator.marginTrading?.marginConversionRate,
        },
      },
      { emitEvent: false },
    );

    // patch issued cash
    existing.simulator.cashAdditionalIssued.forEach((cash) => {
      this.onAddIssuedCash();
      this.form.controls.cashIssued.controls.at(-1)?.patchValue(cash, {
        emitEvent: false,
      });
    });

    // patch market change
    existing.simulator.marketChange.forEach((change) => {
      this.onAddMarketChange();
      this.form.controls.marketChange.controls.at(-1)?.patchValue(change, {
        emitEvent: false,
      });
    });

    // remove existing symbols (default values)
    this.form.controls.symbolsHistoricalData.clear();

    // patch symbols
    existing.simulatorSymbols.forEach((symbol) => {
      this.onAddSymbol(symbol);
    });
  }
}
