import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
  PositionColoringDirective,
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
  ],
  template: `
    <div
      class="xl:absolute xl:top-[-100px] xl:left-0 flex flex-col md:flex-row justify-between md:items-center gap-6 mb-10"
    >
      <!-- display user rank -->
      <app-section-title
        matIcon="military_tech"
        title="My rank: {{ userDataSignal().systemRank?.portfolioTotalGainsPercentage?.rank ?? 'N/A' }}"
      />
      <!-- search users -->
      <app-user-search-control
        class="md:scale-90 w-full md:w-[500px] xl:mt-3"
        (selectedUserEmitter)="onUserClick($event)"
      ></app-user-search-control>
    </div>

    <div class="flex flex-col lg:flex-row gap-x-10 gap-y-4 overflow-y-clip">
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
          <app-general-card>
            <app-portfolio-rank-table
              (clickedItem)="onUserClick($event)"
              [data]="displayPortfolioDataSignal()"
              [template]="userTemplate"
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
        <div class="p-4 lg:basis-2/6 xl:basis-3/6 gap-y-6 grid">
          <!-- daily best -->
          <div class="@container">
            <app-section-title title="Daily Gainers" class="mb-6" />
            <div class="grid @xl:grid-cols-2 gap-3">
              @for (user of hallOfFameUses.bestDailyGains; track user.id) {
                <app-user-display-item
                  (click)="onUserClick(user)"
                  class="g-clickable-hover-color mb-1 rounded-lg p-2"
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
                  class="g-clickable-hover-color mb-1 rounded-lg p-2"
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
          <div appPositionColoring [position]="position">{{ data.item.personal.displayNameInitials }}</div>
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
  readonly displayUsersLimit = 20;

  userDataSignal = this.authenticationUserStoreService.state.getUserData;

  hallOfFameUsersSignal = toSignal(this.aggregationApiService.getHallOfFameUsers());

  displayPortfolioSignal = computed(() =>
    this.showBestSignal()
      ? this.hallOfFameUsersSignal()?.bestPortfolio ?? []
      : this.hallOfFameUsersSignal()?.worstPortfolio ?? [],
  );
  displayPortfolioDataSignal = computed(() =>
    this.showMoreSignal()
      ? this.displayPortfolioSignal()
      : this.displayPortfolioSignal().slice(0, this.displayUsersLimit),
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
