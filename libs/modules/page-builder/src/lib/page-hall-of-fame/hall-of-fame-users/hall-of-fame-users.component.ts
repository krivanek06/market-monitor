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
import {
  UserDetailsDialogComponent,
  UserDetailsDialogComponentData,
  UserSearchControlComponent,
} from '@market-monitor/modules/user/features';
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
    UserSearchControlComponent,
  ],
  template: `
    <div class="absolute top-[-100px] left-0 hidden md:flex items-center gap-6">
      <!-- display user rank -->
      <app-section-title
        class=""
        matIcon="military_tech"
        title="My rank: {{ userDataSignal().systemRank?.portfolioTotalGainsPercentage?.rank ?? 'N/A' }}"
      />
      <!-- search users -->
      <app-user-search-control
        class="scale-90 w-[500px] mt-3"
        (selectedUserEmitter)="onUserClick($event)"
      ></app-user-search-control>
    </div>

    <div class="flex flex-col lg:flex-row gap-x-10 gap-y-4">
      @if (hallOfFameUsersSignal(); as hallOfFameUses) {
        <div class="lg:basis-4/6 xl:basis-3/6">
          <div class="flex items-center justify-between lg:px-2 mb-4">
            <!-- title -->
            <app-section-title title="Top Users" class="mt-2" />

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
                {{ showBestSignal() ? 'Best Users' : ' Worst Users' }}
              </button>
            </div>
          </div>

          <!-- table -->
          <app-portfolio-rank-table
            (clickedItem)="onUserClick($event)"
            [data]="displayPortfolioSignal()"
            [template]="userTemplate"
          />

          <!-- show more button -->
          <div *ngIf="showMoreButtonVisibleSignal()" class="flex justify-end mt-4">
            <button (click)="showMoreToggle()" mat-stroked-button color="primary" type="button">
              {{ showMoreSignal() ? 'Show Less' : ' Show More' }}
            </button>
          </div>
        </div>
        <div class="p-4 lg:basis-2/6 xl:basis-3/6 gap-y-6 grid">
          <!-- daily best -->
          <div class="@container">
            <app-section-title title="Daily Gainers" class="mb-6" />
            <div class="grid @xl:grid-cols-2 gap-3">
              @for (user of hallOfFameUses.bestDailyGains; track user.id) {
                <app-user-display-item
                  (click)="onUserClick(user)"
                  class="g-clickable-hover mb-3"
                  [showLoginButton]="false"
                  [userData]="user"
                />
              } @empty {
                <div class="@xl:col-span-2">No Data Found</div>
              }
            </div>
          </div>

          <!-- daily worst -->
          <div class="@container">
            <app-section-title title="Daily Losers" class="mb-6" />
            <div class="grid @xl:grid-cols-2 gap-3">
              @for (user of hallOfFameUses.worstDailyGains; track user.id) {
                <app-user-display-item
                  (click)="onUserClick(user)"
                  class="g-clickable-hover mb-3"
                  [showLoginButton]="false"
                  [userData]="user"
                />
              } @empty {
                <div class="@xl:col-span-2">No Data Found</div>
              }
            </div>
          </div>
        </div>
      }
    </div>

    <!-- template for user data in table -->
    <ng-template #userTemplate let-data="data" let-position="position">
      <div class="flex items-center gap-3">
        <mat-icon [color]="data.item.isAccountActive ? 'accent' : 'warn'"> radio_button_checked </mat-icon>
        <img appDefaultImg [src]="data.item.personal.photoURL" alt="user image" class="w-10 h-10 rounded-lg" />
        <div class="flex items-center gap-2">
          <div appPositionColoring [position]="position">{{ data.item.personal.displayName }}</div>
          <!-- display position change if any -->
          @if (data.portfolioTotalGainsPercentage?.rankChange; as rankChange) {
            @if (rankChange !== 0) {
              <div class="flex items-center gap-1 ml-4">
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
