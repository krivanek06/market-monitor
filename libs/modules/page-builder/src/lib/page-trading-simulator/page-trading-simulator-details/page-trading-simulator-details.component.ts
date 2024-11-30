import { NgClass, SlicePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { UserBaseMin } from '@mm/api-types';
import {
  PortfolioGrowthCompareChartComponent,
  PortfolioTransactionsItemComponent,
  PortfolioTransactionsTableComponent,
} from '@mm/portfolio/ui';
import { InputSource } from '@mm/shared/data-access';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import {
  DropdownControlComponent,
  GeneralCardComponent,
  RangeDirective,
  SectionTitleComponent,
  SortReversePipe,
} from '@mm/shared/ui';
import {
  TradingSimulatorParticipantDialogComponent,
  TradingSimulatorParticipantDialogComponentData,
} from '@mm/trading-simulator/features';
import {
  TradingSimulatorParticipantItemComponent,
  TradingSimulatorSymbolPriceChartComponent,
  TradingSimulatorSymbolPriceChartLegendComponent,
  TradingSimulatorSymbolStatTableComponent,
} from '@mm/trading-simulator/ui';
import { addSeconds, differenceInSeconds } from 'date-fns';
import { filterNil } from 'ngxtension/filter-nil';
import { first, forkJoin, iif, map, of, switchMap, timer } from 'rxjs';
import { PageTradingSimulatorBaseComponent } from '../base/page-trading-simulator-base.component';
import { PageTradingSimulatorDetailsButtonsComponent } from './components/page-trading-simulator-details-buttons/page-trading-simulator-details-buttons.component';
import { PageTradingSimulatorDetailsInfoComponent } from './components/page-trading-simulator-details-info/page-trading-simulator-details-info.component';
import { PageTradingSimulatorDetailsParticipantDataComponent } from './components/page-trading-simulator-details-participant-data/page-trading-simulator-details-participant-data.component';

@Component({
  selector: 'app-page-trading-simulator-details',
  standalone: true,
  imports: [
    MatIconModule,
    MatButtonModule,
    PageTradingSimulatorDetailsButtonsComponent,
    SectionTitleComponent,
    TradingSimulatorSymbolPriceChartComponent,
    TradingSimulatorSymbolPriceChartLegendComponent,
    TradingSimulatorSymbolStatTableComponent,
    TradingSimulatorParticipantItemComponent,
    PortfolioTransactionsItemComponent,
    PageTradingSimulatorDetailsInfoComponent,
    GeneralCardComponent,
    SlicePipe,
    RangeDirective,
    PortfolioGrowthCompareChartComponent,
    PortfolioTransactionsTableComponent,
    PageTradingSimulatorDetailsParticipantDataComponent,
    NgClass,
    SortReversePipe,
    DropdownControlComponent,
    ReactiveFormsModule,
  ],
  template: `
    @if (simulatorData(); as simulatorData) {
      <div class="mb-6 flex items-center justify-between">
        <app-section-title title="Simulator: {{ simulatorData.name }}" />

        <!-- buttons to the owner -->
        <app-page-trading-simulator-details-buttons [simulatorData]="simulatorData" />
      </div>

      <!-- participant data -->
      @if (participant(); as participant) {
        <div class="mb-6">
          <app-page-trading-simulator-details-participant-data
            [participant]="participant"
            [simulatorData]="simulatorData"
            [symbolAggregations]="simulatorAggregationSymbols()"
            [remainingTimeSeconds]="remainingTimeSeconds()"
          />
        </div>
      }

      <div class="mb-6 grid grid-cols-4 gap-x-10">
        <!-- left side -->
        <div class="col-span-3">
          <!-- symbol info -->
          <div class="mb-4 flex justify-between">
            <app-section-title
              title="Symbol Price Movement"
              titleSize="lg"
              description="Charts indicates how the prices of each symbol have changed over time."
            />

            <app-trading-simulator-symbol-price-chart-legend [isOwner]="isAuthUserOwner()" />
          </div>

          <!-- display charts of symbols -->
          <div class="mb-6 grid grid-cols-3 gap-x-6 gap-y-3">
            @for (symbol of simulatorSymbols(); track symbol.symbol) {
              <app-trading-simulator-symbol-price-chart
                [simulator]="simulatorData"
                [simulatorSymbol]="symbol"
                [authUser]="authUserData()"
                [heightPx]="185"
              />
            } @empty {
              <div *ngRange="simulatorData.symbolAvailable" class="g-skeleton h-[185px]"></div>
            }
          </div>

          <!-- symbol statistics -->
          <app-section-title
            title="Symbol Statistics"
            description="Data updates in real time as participants create transactions"
            class="mb-3 pl-3"
            titleSize="lg"
          />
          <app-general-card>
            <app-trading-simulator-symbol-stat-table [data]="simulatorAggregationSymbols()" />
          </app-general-card>
        </div>

        <!-- right side -->
        <div>
          <!-- simulator info -->
          <app-page-trading-simulator-details-info
            [tradingSimulator]="simulatorData"
            [remainingTimeSeconds]="remainingTimeSeconds()"
            [isAuthUserOwner]="isAuthUserOwner()"
          />
        </div>
      </div>

      <!-- participant ranking -->
      <app-section-title title="Participant Ranking" matIcon="people" class class="mb-3" titleSize="lg" />
      <app-general-card class="mb-6">
        <div class="grid gap-x-6 gap-y-4 p-4 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
          @if (participantRanking(); as participantRanking) {
            @for (participant of participantRanking; track participant.userData.id; let i = $index) {
              <button mat-stroked-button (click)="onParticipantClick(participant.userData)" class="h-12 p-2">
                <app-trading-simulator-participant-item
                  [participant]="participant"
                  [position]="participant.rank.rank"
                />
              </button>
            } @empty {
              <div class="min-h-[200px] p-4 text-center">No participants</div>
            }
          } @else {
            <div *ngRange="simulatorData.currentParticipants" class="g-skeleton h-10"></div>
          }
        </div>
      </app-general-card>

      <!-- participant compare -->
      <div class="mb-4 flex items-center justify-between">
        <!-- title -->
        <app-section-title matIcon="compare_arrows" title="Compare Participants" titleSize="lg" />

        <app-dropdown-control
          inputCaption="Select Participants"
          [inputSource]="participantsInputSource()"
          [formControl]="selectedParticipantsControl"
          class="w-[400px]"
          inputType="MULTISELECT"
        />
      </div>
      <div class="mb-8">
        <app-portfolio-growth-compare-chart filterType="round" [data]="selectedParticipants()" />
      </div>

      <!-- display transactions -->
      <div class="grid grid-cols-3 gap-x-4">
        <app-portfolio-transactions-table
          [data]="simulatorAggregationTransactions()?.lastTransactions | sortReverse"
          [showSymbolFilter]="true"
          [pageSize]="15"
          [displayedColumns]="displayedColumnsTransactionTable"
          title="Transaction History - Last 100"
          class="col-span-2"
        />

        <div class="grid gap-y-6 lg:pt-6">
          <!-- best transactions -->
          <app-general-card title="Best Returns" matIcon="trending_up" class="flex-1">
            @for (
              item of simulatorAggregationTransactions()?.bestTransactions | slice: 0 : 5;
              track item.transactionId;
              let last = $last
            ) {
              <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
                <app-portfolio-transactions-item dateType="round" [displayUser]="true" [transaction]="item" />
              </div>
            }
          </app-general-card>

          <!-- worst transactions -->
          <app-general-card title="Worst Returns" matIcon="trending_down" class="flex-1">
            @for (
              item of simulatorAggregationTransactions()?.worstTransactions | slice: 0 : 5;
              track item.transactionId;
              let last = $last
            ) {
              <div class="py-2" [ngClass]="{ 'g-border-bottom': !last }">
                <app-portfolio-transactions-item dateType="round" [displayUser]="true" [transaction]="item" />
              </div>
            }
          </app-general-card>
        </div>
      </div>
    }
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorDetailsComponent extends PageTradingSimulatorBaseComponent {
  private readonly dialog = inject(MatDialog);
  readonly selectedParticipantsControl = new FormControl<UserBaseMin[]>([], { nonNullable: true });

  /** participating user data - may not exists if user is only a spectator */
  readonly participant = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) =>
        this.tradingSimulatorService.getTradingSimulatorByIdParticipantById(
          selectedId,
          this.authenticationUserStoreService.state.getUser().uid,
        ),
      ),
    ),
  );

  readonly remainingTimeSeconds = toSignal(
    toObservable(this.simulatorData).pipe(
      switchMap((simulatorData) =>
        simulatorData && simulatorData.state === 'started'
          ? timer(0, 1000).pipe(map(() => differenceInSeconds(simulatorData?.nextRoundTime, new Date())))
          : of(0),
      ),
    ),
    { initialValue: 0 },
  );

  readonly participantRanking = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) => this.tradingSimulatorService.getTradingSimulatorAggregationParticipants(selectedId)),
    ),
    { initialValue: [] },
  );

  /** dropdown of participants in the simulator */
  readonly participantsInputSource = computed(() =>
    this.participantRanking()?.map(
      (d) =>
        ({
          caption: d.userData.personal.displayName,
          image: d.userData.personal.photoURL,
          value: d.userData,
          imageType: 'default',
        }) satisfies InputSource<UserBaseMin>,
    ),
  );

  readonly selectedParticipants = toSignal(
    this.simulatorId$.pipe(
      switchMap((selectedId) =>
        this.selectedParticipantsControl.valueChanges.pipe(
          switchMap((participants) =>
            iif(
              () => participants.length > 0,
              forkJoin(
                participants.map((p) =>
                  this.tradingSimulatorService
                    .getTradingSimulatorByIdParticipantById(selectedId, p.id)
                    .pipe(first(), filterNil()),
                ),
              ),
              of([]),
            ),
          ),
        ),
      ),
    ),
    { initialValue: [] },
  );

  /**
   * add top N participants (and myself if I am a participant) into the compare chart
   */
  readonly displayParticipantsInCompareChart = effect(() => {
    const participant = this.participant();
    const participants = this.participantRanking();
    const selectedParticipants = this.selectedParticipantsControl.value;

    console.log('edkooooo', addSeconds(new Date(), 3).toString());

    console.log({
      participant,
      participants,
    });

    untracked(() => {
      // set the selected participants to the top 5 users - using 1 because ignoring the current user
      if (selectedParticipants.length <= 1) {
        console.log('displayParticipantsInCompareChart adding participants');
        // top users except the current user
        const topUsers = participants
          .filter((d) => d.userData.id !== participant?.userData.id)
          .slice(0, 5)
          .map((d) => d.userData);

        // set the selected participants
        this.selectedParticipantsControl.patchValue(topUsers);
      }

      // add current user if not there
      if (participant?.userData && !selectedParticipants.find((d) => d.id === participant?.userData.id)) {
        console.log('displayParticipantsInCompareChart adding myself');
        this.selectedParticipantsControl.patchValue([...selectedParticipants, participant.userData]);
      }
    });
  });

  // todo - reduce number of users to be display on smaller screen and add a "show more" button
  // todo - display top 5 users in the compare chart + myself as participant

  readonly displayedColumnsTransactionTable = [
    'symbol',
    'transactionType',
    'user',
    'totalValue',
    'unitPrice',
    'units',
    'transactionFees',
    'rounds',
    'returnPrctOnly',
  ];

  onParticipantClick(participant: UserBaseMin) {
    this.dialog.open(TradingSimulatorParticipantDialogComponent, {
      data: <TradingSimulatorParticipantDialogComponentData>{
        simulator: this.simulatorData(),
        participantId: participant.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
