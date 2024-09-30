import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { Router } from '@angular/router';
import { AggregationApiService } from '@mm/api-client';
import { GroupBase, UserBase } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { GroupSearchControlComponent } from '@mm/group/features';
import { PortfolioRankTableComponent } from '@mm/portfolio/ui';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import {
  DefaultImgDirective,
  GeneralCardComponent,
  PercentageIncreaseDirective,
  PositionColoringDirective,
  RangeDirective,
  RankCardComponent,
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
  selector: 'app-page-hall-of-fame',
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
    PercentageIncreaseDirective,
    MatTabsModule,
    GroupSearchControlComponent,
  ],
  template: `
    <div class="mb-6 flex items-center justify-between">
      <app-section-title matIcon="military_tech" title="Hall Of Fame" />
      <app-section-title
        matIcon="military_tech"
        title="My rank: {{ userData().systemRank?.portfolioTotalGainsPercentage?.rank ?? 'N/A' }}"
      />
    </div>

    <!-- best users -->
    <div class="mb-10 flex justify-around gap-4 max-xl:overflow-x-scroll">
      @for (user of hallOfFameUsers().bestPortfolio | slice: 0 : topUsersLimit; track user.item.id; let i = $index) {
        <app-rank-card
          data-testid="hall-of-fame-user-rank-card"
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
    </div>

    <div class="mb-4 flex items-center justify-between">
      <!-- search users -->
      <app-user-search-control
        data-testid="hall-of-fame-user-search-control"
        class="w-full md:w-[500px]"
        (selectedEmitter)="onUserClick($event)"
      />
      <!-- search groups -->
      <app-group-search-control
        data-testid="hall-of-fame-group-search-control"
        class="hidden w-full md:w-[500px] lg:block"
        (selectedEmitter)="onGroupClick($event)"
      />
    </div>

    <!-- daily best / worst users -->
    <div class="mb-6 flex items-center justify-between">
      <app-section-title [title]="showBestSignal() ? 'Daily Gainers' : 'Daily Losers'" />
      <!-- best/worst button -->
      <button
        data-testid="hall-of-fame-best-worst-button"
        (click)="onShowBestToggle()"
        [color]="showBestSignal() ? 'accent' : 'warn'"
        mat-stroked-button
        type="button"
      >
        @if (showBestSignal()) {
          <mat-icon>arrow_drop_up</mat-icon>
        } @else {
          <mat-icon>arrow_drop_down</mat-icon>
        }
        {{ showBestSignal() ? 'Top Gainers' : ' Top Losers' }}
      </button>
    </div>

    <!-- displayed best/worst daily users -->
    <div class="mb-10 grid items-center gap-x-4 gap-y-2 overflow-x-hidden md:grid-cols-2 xl:grid-cols-4">
      @for (user of bestWorstDailyUsers(); track user.id) {
        <app-general-card>
          <app-user-display-item
            data-testid="hall-of-fame-user-display-item-daily-top"
            (itemClicked)="onUserClick(user)"
            [clickable]="true"
            [showDailyPortfolioChange]="true"
            class="mb-1 rounded-lg p-2"
            [userData]="user"
          />
        </app-general-card>
      } @empty {
        <div>No Data Found</div>
      }
    </div>

    <mat-tab-group mat-stretch-tabs="false" mat-align-tabs="end">
      <!-- user ranking -->
      <mat-tab label="User Ranking">
        <app-general-card>
          <app-portfolio-rank-table
            data-testid="hall-of-fame-user-ranking-table"
            (itemClicked)="onUserClick($event)"
            [data]="displayUserTable()"
            [template]="userTemplate"
            [initialPosition]="topUsersLimit + 1"
            [highlightPosition]="userData().systemRank?.portfolioTotalGainsPercentage?.rank"
          />

          <!-- show more button -->
          <div class="flex justify-end">
            <app-show-more-button
              data-testid="hall-of-fame-user-ranking-table-show-more"
              [itemsTotal]="hallOfFameUsers().bestPortfolio.length - topUsersLimit"
              [itemsLimit]="displayUsersLimit"
              [(showMoreToggle)]="showMoreSignal"
            />
          </div>
        </app-general-card>
      </mat-tab>

      <!-- group's ranking -->
      <mat-tab label="Group Ranking">
        <app-general-card>
          <app-portfolio-rank-table
            data-testid="hall-of-fame-group-ranking-table"
            (itemClicked)="onGroupClick($event)"
            [data]="displayGroupsTable()"
            [template]="groupTemplate"
          />

          <!-- show more button -->
          <div class="flex justify-end">
            <app-show-more-button
              data-testid="hall-of-fame-group-ranking-table-show-more"
              [itemsTotal]="hallOfFameGroups().bestPortfolio.length"
              [itemsLimit]="displayUsersLimit"
              [(showMoreToggle)]="showMoreSignal"
            />
          </div>
        </app-general-card>
      </mat-tab>
    </mat-tab-group>

    <!-- template for user data in table -->
    <ng-template #userTemplate let-data="data" let-position="position">
      <div class="flex items-center gap-3">
        <mat-icon class="hidden md:block" [color]="data.item.isAccountActive ? 'accent' : 'warn'">
          radio_button_checked
        </mat-icon>
        <img appDefaultImg [src]="data.item.personal.photoURL" alt="user image" class="h-8 w-8 rounded-lg" />
        <div class="flex items-center gap-2">
          <div class="hidden sm:block">{{ data.item.personal.displayName }}</div>
          <div class="block sm:hidden">{{ data.item.personal.displayNameInitials }}</div>
          <!-- display position change if any -->
          @if (data.portfolioTotalGainsPercentage?.rankChange; as rankChange) {
            @if (rankChange !== 0) {
              <div class="ml-4 flex items-center gap-1">
                <span [ngClass]="{ 'text-wt-success': rankChange > 0, 'text-wt-danger': rankChange < 0 }">
                  {{ rankChange }}
                </span>
                @if (rankChange > 0) {
                  <mat-icon color="accent" class="scale-150">arrow_drop_up</mat-icon>
                } @else if (rankChange < 0) {
                  <mat-icon color="warn" class="scale-150">arrow_drop_down</mat-icon>
                }
              </div>
            }
          }
        </div>
      </div>
    </ng-template>

    <!-- template for user data in table -->
    <ng-template #groupTemplate let-data="data" let-position="position">
      <div class="flex items-center gap-3">
        <img appDefaultImg [src]="data.item.imageUrl" alt="user image" class="h-8 w-8 rounded-lg" />
        <div class="flex items-center gap-2">
          <div class="w-[100px] truncate text-ellipsis sm:w-[200px]">
            {{ data.item.name }}
          </div>
          <!-- display position change if any -->
          @if (data.portfolioTotalGainsPercentage?.rankChange; as rankChange) {
            @if (rankChange !== 0) {
              <div class="ml-4 flex items-center gap-1">
                <span [ngClass]="{ 'text-wt-success': rankChange > 0, 'text-wt-danger': rankChange < 0 }">
                  {{ rankChange }}
                </span>
                @if (rankChange > 0) {
                  <mat-icon color="accent" class="scale-150">arrow_drop_up</mat-icon>
                } @else if (rankChange < 0) {
                  <mat-icon color="warn" class="scale-150">arrow_drop_down</mat-icon>
                }
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
export class PageHallOfFameComponent {
  private readonly aggregationApiService = inject(AggregationApiService);
  private readonly authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);

  /**
   * limit number of users to display, display rest on "show more"
   */
  readonly displayUsersLimit = 20;
  readonly topUsersLimit = 5;

  readonly userData = this.authenticationUserStoreService.state.getUserData;
  readonly hallOfFameUsers = this.aggregationApiService.hallOfFameUsers;
  readonly hallOfFameGroups = this.aggregationApiService.hallOfFameGroups;

  /**
   * if true shows more users, if false shows less users
   */
  readonly showMoreSignal = signal(false);

  /**
   * if true shows best users, if false shows worst users
   */
  readonly showBestSignal = signal(true);

  readonly displayUserTable = computed(() => {
    // remove first 10 users from best users
    const bestUsers = this.hallOfFameUsers().bestPortfolio.slice(this.topUsersLimit);
    // check if display all or not
    return this.showMoreSignal() ? bestUsers : bestUsers.slice(0, this.displayUsersLimit);
  });

  readonly displayGroupsTable = computed(() =>
    this.showMoreSignal()
      ? this.hallOfFameGroups().bestPortfolio
      : this.hallOfFameGroups().bestPortfolio.slice(0, this.displayUsersLimit),
  );

  readonly bestWorstDailyUsers = computed(() =>
    (this.showBestSignal() ? this.hallOfFameUsers().bestDailyGains : this.hallOfFameUsers().worstDailyGains).slice(
      0,
      4,
    ),
  );

  onUserClick(user: UserBase) {
    this.dialog.open(UserDetailsDialogComponent, {
      data: <UserDetailsDialogComponentData>{
        userId: user.id,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }

  onGroupClick(group: GroupBase) {
    this.router.navigateByUrl(`/${ROUTES_MAIN.GROUPS}/${group.id}`);
  }

  onShowBestToggle() {
    this.showBestSignal.set(!this.showBestSignal());
  }
}
