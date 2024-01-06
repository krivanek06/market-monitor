import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { AggregationApiService } from '@market-monitor/api-client';
import { UserBase } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { PortfolioRankTableComponent } from '@market-monitor/modules/portfolio/ui';
import { UserDetailsDialogComponent, UserDetailsDialogComponentData } from '@market-monitor/modules/user/features';
import { UserDisplayItemComponent } from '@market-monitor/modules/user/ui';
import { SCREEN_DIALOGS } from '@market-monitor/shared/features/dialog-manager';
import { DefaultImgDirective, PositionColoringDirective, SectionTitleComponent } from '@market-monitor/shared/ui';

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
  ],
  template: `
    <!-- display user rank -->
    <app-section-title
      class="absolute top-[-80px] left-0 hidden md:block"
      matIcon="military_tech"
      title="My rank: {{ userDataSignal().systemRank.portfolioTotalGainsPercentage?.rank }}"
    />

    <div class="flex flex-col lg:flex-row gap-x-10 gap-y-4">
      @if (hallOfFameUsersSignal(); as hallOfFameUses) {
        <div class="lg:basis-4/6 xl:basis-3/6">
          <div class="flex items-center justify-between lg:px-2">
            <!-- title -->
            <app-section-title title="Top Users" />

            <div class="flex items-center gap-4">
              <!-- best/worst button -->
              <button
                (click)="showBestToggle()"
                [color]="showBestSignal() ? 'accent' : 'warn'"
                mat-stroked-button
                type="button"
              >
                <mat-icon *ngIf="showBestSignal()">arrow_drop_up</mat-icon>
                <mat-icon *ngIf="!showBestSignal()">arrow_drop_down</mat-icon>
                @if (showBestSignal()) {
                  Best Users
                } @else {
                  Worst Users
                }
              </button>

              <!-- show more button -->
              <button
                *ngIf="showMoreButtonVisibleSignal()"
                (click)="showMoreToggle()"
                mat-stroked-button
                color="primary"
                type="button"
              >
                @if (showMoreSignal()) {
                  Show More
                } @else {
                  Show Less
                }
              </button>
            </div>
          </div>

          <!-- table -->
          <app-portfolio-rank-table
            (clickedItem)="onUserClick($event)"
            [data]="displayPortfolioSignal()"
            [template]="userTemplate"
          />
        </div>
        <div class="p-4 lg:basis-2/6 xl:basis-3/6 grid xl:grid-cols-2 gap-y-10">
          <!-- daily best -->
          <div>
            <app-section-title title="Daily Gainers" class="mb-6" />
            @for (user of hallOfFameUses.bestDailyGains; track user.id) {
              <app-user-display-item
                (click)="onUserClick(user)"
                class="g-clickable-hover"
                [showLoginButton]="false"
                [userData]="user"
              />
            } @empty {
              <div>No Data Found</div>
            }
          </div>

          <!-- daily worst -->
          <div>
            <app-section-title title="Daily Losers" class="mb-6" />
            @for (user of hallOfFameUses.worstDailyGains; track user.id) {
              <app-user-display-item
                (click)="onUserClick(user)"
                class="g-clickable-hover"
                [showLoginButton]="false"
                [userData]="user"
              />
            } @empty {
              <div>No Data Found</div>
            }
          </div>
        </div>
      }
    </div>

    <!-- template for user data in table -->
    <ng-template #userTemplate let-data="data" let-position="position">
      <div class="flex items-center gap-3">
        <img appDefaultImg [src]="data.personal.photoURL" alt="user image" class="w-10 h-10 rounded-lg" />
        <div class="grid">
          <div appPositionColoring [position]="position">{{ data.personal.displayName }}</div>
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
  private displayUsersLimit = 20;

  userDataSignal = this.authenticationUserStoreService.state.getUserData;

  hallOfFameUsersSignal = toSignal(this.aggregationApiService.getHallOfFameUsers());

  displayPortfolioSignal = computed(() => {
    const data = this.showBestSignal()
      ? this.hallOfFameUsersSignal()?.bestPortfolio ?? []
      : this.hallOfFameUsersSignal()?.worstPortfolio ?? [];
    return !this.showMoreSignal() ? data.slice(0, this.displayUsersLimit) : data;
  });

  showMoreButtonVisibleSignal = computed(
    () => (this.hallOfFameUsersSignal()?.bestPortfolio?.length ?? 0) > this.displayUsersLimit,
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

  showMoreToggle() {
    this.showMoreSignal.set(!this.showMoreSignal());
  }

  showBestToggle() {
    this.showBestSignal.set(!this.showBestSignal());
  }
}
