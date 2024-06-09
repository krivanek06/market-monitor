import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AggregationApiService } from '@mm/api-client';
import { UserBase } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { PortfolioRankTableComponent } from '@mm/portfolio/ui';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import {
  DefaultImgDirective,
  GeneralCardComponent,
  PercentageIncreaseDirective,
  PositionColoringDirective,
  RangeDirective,
  RankCardComponent,
  ScrollWrapperComponent,
  SectionTitleComponent,
  ShowMoreButtonComponent,
} from '@mm/shared/ui';
import {
  UserDetailsDialogComponent,
  UserDetailsDialogComponentData,
  UserSearchControlComponent,
} from '@mm/user/features';
import { UserDisplayItemComponent } from '@mm/user/ui';

@Component({
  selector: 'app-hall-of-fame-users',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioRankTableComponent,
    DefaultImgDirective,
    SectionTitleComponent,
    MatButtonModule,
    UserDisplayItemComponent,
    MatIconModule,
    UserDetailsDialogComponent,
    MatDialogModule,
    PositionColoringDirective,
    UserSearchControlComponent,
    ShowMoreButtonComponent,
    GeneralCardComponent,
    RangeDirective,
    RankCardComponent,
    ScrollWrapperComponent,
    PercentageIncreaseDirective,
  ],
  template: `
    <!-- best users -->
    <app-scroll-wrapper [heightPx]="220" class="mb-6">
      @for (user of hallOfFameUsersSignal()?.bestPortfolio ?? [] | slice: 0 : 10; track user.item.id; let i = $index) {
        <app-rank-card
          [clickable]="true"
          [currentPositions]="i + 1"
          [image]="user.item.personal.photoURL"
          [positionChange]="user.portfolioTotalGainsPercentage?.rankChange"
          [cardWidthPx]="240"
          [cardHeightPx]="180"
          (itemClicked)="onUserClick(user.item)"
        >
          <div class="bg-wt-gray-light absolute bottom-0 flex w-full flex-col px-4 py-2">
            <!-- user's name -->
            <div class="text-wt-gray-dark">{{ user.item.personal.displayName }}</div>
            <div class="flex items-center justify-between">
              <!-- user's balance -->
              <div>{{ user.item.portfolioState.balance | currency }}</div>
              <!-- user's portfolio -->
              <div
                appPercentageIncrease
                [useCurrencySign]="true"
                [changeValues]="{
                  changePercentage: user.item.portfolioState.totalGainsPercentage,
                }"
              ></div>
            </div>
          </div>
        </app-rank-card>
      }
    </app-scroll-wrapper>

    <div class="flex flex-col gap-x-10 gap-y-4 overflow-y-clip lg:flex-row">
      <div class="lg:basis-4/6 xl:basis-3/4">
        <div class="mb-2 flex items-center justify-between lg:px-2">
          <!-- display user rank -->
          <app-section-title
            matIcon="military_tech"
            title="My rank: {{ userDataSignal().systemRank?.portfolioTotalGainsPercentage?.rank ?? 'N/A' }}"
          />

          <div class="">
            <!-- search users -->
            <app-user-search-control
              class="w-full md:w-[500px] md:scale-90 xl:mt-3"
              (selectedUserEmitter)="onUserClick($event)"
            />
          </div>
        </div>

        <!-- table -->
        <app-general-card>
          <app-portfolio-rank-table
            (clickedItem)="onUserClick($event)"
            [data]="displayPortfolioDataSignal()"
            [template]="userTemplate"
            [initialPosition]="11"
          />

          <!-- show more button -->
          <div class="flex justify-end">
            <app-show-more-button
              [itemsTotal]="displayPortfolioSignal().length"
              [itemsLimit]="displayUsersLimit"
              [(showMoreToggle)]="showMoreSignal"
            />
          </div>
        </app-general-card>
      </div>

      <div class="grid gap-y-6 p-4 lg:basis-2/6 xl:basis-1/4">
        <!-- daily best / worst users -->
        <div>
          <div class="mb-6 flex items-center justify-between">
            <app-section-title [title]="showBestSignal() ? 'Daily Gainers' : 'Daily Losers'" />
            <!-- best/worst button -->
            <button
              (click)="showBestToggle()"
              [color]="showBestSignal() ? 'accent' : 'warn'"
              mat-stroked-button
              type="button"
            >
              <mat-icon *ngIf="showBestSignal()">arrow_drop_up</mat-icon>
              <mat-icon *ngIf="!showBestSignal()">arrow_drop_down</mat-icon>
              {{ showBestSignal() ? 'Top Gainers' : ' Top Losers' }}
            </button>
          </div>

          <div class="@xl:grid-cols-2 grid gap-3">
            @for (user of bestWorstDailyUsers(); track user.id) {
              <app-user-display-item
                (itemClicked)="onUserClick(user)"
                [clickable]="true"
                [showDailyPortfolioChange]="true"
                class="mb-1 rounded-lg p-2"
                [userData]="user"
              />
            }
            @if (bestWorstDailyUsers().length === 0) {
              <div class="@xl:col-span-2">No Data Found</div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- template for user data in table -->
    <ng-template #userTemplate let-data="data" let-position="position">
      <div class="flex items-center gap-3">
        <mat-icon [color]="data.item.isAccountActive ? 'accent' : 'warn'"> radio_button_checked </mat-icon>
        <img appDefaultImg [src]="data.item.personal.photoURL" alt="user image" class="h-10 w-10 rounded-lg" />
        <div class="flex items-center gap-2">
          <div appPositionColoring [position]="position">{{ data.item.personal.displayNameInitials }}</div>
          <!-- display position change if any -->
          @if (data.portfolioTotalGainsPercentage?.rankChange; as rankChange) {
            @if (rankChange !== 0) {
              <div class="ml-4 flex items-center gap-1">
                <span [ngClass]="{ 'text-wt-success': rankChange > 0, 'text-wt-danger': rankChange < 0 }">
                  {{ rankChange }}
                </span>
                <mat-icon *ngIf="rankChange > 0" color="accent" class="scale-150">arrow_drop_up</mat-icon>
                <mat-icon *ngIf="rankChange < 0" color="warn" class="scale-150">arrow_drop_down</mat-icon>
              </div>
            }
          }
        </div>
      </div>
    </ng-template>
  `,
  styles: `
    :host {
      display: block;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HallOfFameUsersComponent {
  private aggregationApiService = inject(AggregationApiService);
  private authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private dialog = inject(MatDialog);

  /**
   * limit number of users to display, display rest on "show more"
   */
  readonly displayUsersLimit = 20;

  userDataSignal = this.authenticationUserStoreService.state.getUserData;

  hallOfFameUsersSignal = this.aggregationApiService.hallOfFameUsers;

  displayPortfolioSignal = computed(() => (this.hallOfFameUsersSignal()?.bestPortfolio ?? []).slice(0, 10));
  displayPortfolioDataSignal = computed(() => {
    // remove first 10 users from best users
    const bestUsers = (this.hallOfFameUsersSignal()?.bestPortfolio ?? []).slice(10);
    // check if display all or not
    return this.showMoreSignal() ? bestUsers : bestUsers.slice(0, this.displayUsersLimit);
  });

  bestWorstDailyUsers = computed(() =>
    (this.showBestSignal()
      ? this.hallOfFameUsersSignal()?.bestDailyGains ?? []
      : this.hallOfFameUsersSignal()?.worstDailyGains ?? []
    ).slice(0, 5),
  );

  /**
   * if true shows more users, if false shows less users
   */
  showMoreSignal = signal(false);

  /**
   * if true shows best users, if false shows worst users
   */
  showBestSignal = signal(true);

  onUserClick(user: UserBase) {
    this.dialog.open(UserDetailsDialogComponent, {
      data: <UserDetailsDialogComponentData>{
        userId: user.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }

  showBestToggle() {
    this.showBestSignal.set(!this.showBestSignal());
  }
}
