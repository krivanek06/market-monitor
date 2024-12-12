import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { TradingSimulator, UserBaseMin } from '@mm/api-types';
import { PortfolioGrowthCompareChartComponent } from '@mm/portfolio/ui';
import { InputSource, SCREEN_LAYOUT_VALUES } from '@mm/shared/data-access';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import {
  DropdownControlComponent,
  GeneralCardComponent,
  SectionTitleComponent,
  ShowMoreButtonComponent,
  WINDOW_RESIZE_LISTENER,
} from '@mm/shared/ui';
import { TradingSimulatorService } from '@mm/trading-simulator/data-access';
import {
  TradingSimulatorParticipantDialogComponent,
  TradingSimulatorParticipantDialogComponentData,
} from '@mm/trading-simulator/features';
import { TradingSimulatorParticipantItemComponent } from '@mm/trading-simulator/ui';
import { filterNil } from 'ngxtension/filter-nil';
import { first, forkJoin, iif, of, switchMap } from 'rxjs';

@Component({
  selector: 'app-page-trading-simulator-details-participants-display',
  standalone: true,
  imports: [
    TradingSimulatorParticipantItemComponent,
    PortfolioGrowthCompareChartComponent,
    DropdownControlComponent,
    SectionTitleComponent,
    GeneralCardComponent,
    ReactiveFormsModule,
    MatButtonModule,
    ShowMoreButtonComponent,
  ],
  template: `
    <!-- participant ranking -->
    <app-section-title title="Participant Ranking" matIcon="people" class class="mb-3" />
    <app-general-card class="mb-6">
      <div class="grid gap-x-6 gap-y-4 p-4 lg:grid-cols-2 xl:grid-cols-3">
        @for (participant of displayParticipants().participants; track participant.userData.id; let i = $index) {
          <button mat-stroked-button (click)="onParticipantClick(participant.userData)" class="h-12 p-2">
            <app-trading-simulator-participant-item [participant]="participant" [position]="participant.rank.rank" />
          </button>
        } @empty {
          <div class="min-h-[150px] place-content-center p-4 text-center lg:col-span-2 xl:col-span-3 2xl:col-span-4">
            No participants
          </div>
        }
      </div>
      <!-- more button -->
      <div class="flex justify-end">
        <app-show-more-button
          class="hidden sm:block"
          [(showMoreToggle)]="showMoreParticipantsToggle"
          [itemsLimit]="displayParticipants().current"
          [itemsTotal]="displayParticipants().total"
        />
      </div>
    </app-general-card>

    <!-- participant compare select -->
    <div class="mb-4 flex items-center justify-between max-md:hidden">
      <!-- title -->
      <app-section-title matIcon="compare_arrows" title="Compare Participants" />

      <app-dropdown-control
        inputCaption="Select Participants"
        [inputSource]="participantsInputSource()"
        [formControl]="selectedParticipantsControl"
        class="w-[400px]"
        inputType="MULTISELECT"
      />
    </div>

    <!-- compare chart -->
    <div class="mb-8 max-md:hidden">
      <app-portfolio-growth-compare-chart filterType="round" [data]="selectedParticipants()" />
    </div>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PageTradingSimulatorDetailsParticipantsDisplayComponent {
  private readonly dialog = inject(MatDialog);
  private readonly tradingSimulatorService = inject(TradingSimulatorService);

  readonly simulator = input.required<TradingSimulator>();
  readonly showMoreParticipantsToggle = signal<boolean>(false);

  readonly selectedParticipantsControl = new FormControl<UserBaseMin[]>([], { nonNullable: true });

  private readonly participants = toSignal(
    toObservable(this.simulator).pipe(
      switchMap((simulator) => this.tradingSimulatorService.getTradingSimulatorAggregationParticipants(simulator.id)),
    ),
    { initialValue: [] },
  );

  /** dropdown of participants in the simulator */
  readonly participantsInputSource = computed(() =>
    this.participants().map(
      (d) =>
        ({
          caption: d.userData.personal.displayName,
          image: d.userData.personal.photoURL,
          value: d.userData,
          imageType: 'default',
        }) satisfies InputSource<UserBaseMin>,
    ),
  );

  /**
   * load the selected participants if they are selected
   */
  readonly selectedParticipants = toSignal(
    this.selectedParticipantsControl.valueChanges.pipe(
      switchMap((participants) =>
        iif(
          () => participants.length > 0,
          forkJoin(
            participants.map((p) =>
              this.tradingSimulatorService
                .getTradingSimulatorByIdParticipantById(this.simulator().id, p.id)
                .pipe(first(), filterNil()),
            ),
          ),
          of([]),
        ),
      ),
    ),
    { initialValue: [] },
  );

  private readonly windowWidth = inject(WINDOW_RESIZE_LISTENER);

  readonly displayParticipants = computed(() => {
    const participants = this.participants();
    const windowWidth = this.windowWidth();
    const showMoreParticipantsToggle = this.showMoreParticipantsToggle();

    // show more was clicked
    if (showMoreParticipantsToggle) {
      return {
        participants,
        isMore: false,
        total: participants.length,
        current: participants.length,
      };
    }

    // show partial data
    let display = participants.slice(0, 10);
    if (windowWidth <= SCREEN_LAYOUT_VALUES.LAYOUT_XS) {
      display = participants.slice(0, 5);
    } else if (windowWidth <= SCREEN_LAYOUT_VALUES.LAYOUT_MD) {
      display = participants.slice(0, 10);
    } else if (windowWidth <= SCREEN_LAYOUT_VALUES.LAYOUT_XL) {
      display = participants.slice(0, 15);
    }

    return {
      participants: display,
      isMore: participants.length > display.length,
      total: participants.length,
      current: display.length,
    };
  });

  /**
   * add top N participants into the compare chart
   */
  readonly displayParticipantsInCompareChart = effect(() => {
    const participants = this.participants();
    const selectedParticipants = this.selectedParticipantsControl.value;

    untracked(() => {
      // set the selected participants to the top 5 users
      if (participants.length > 0 && selectedParticipants.length <= 0) {
        // top users except the current user
        const topUsers = participants.slice(0, 5).map((d) => d.userData);

        // set the selected participants
        this.selectedParticipantsControl.patchValue(topUsers);
      }
    });
  });

  onParticipantClick(participant: UserBaseMin) {
    this.dialog.open(TradingSimulatorParticipantDialogComponent, {
      data: <TradingSimulatorParticipantDialogComponentData>{
        simulator: this.simulator(),
        participantId: participant.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
