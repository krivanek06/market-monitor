import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AggregationApiService } from '@market-monitor/api-client';
import { GroupBase } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { GroupDisplayItemComponent } from '@market-monitor/modules/group/ui';
import { PortfolioRankTableComponent } from '@market-monitor/modules/portfolio/ui';
import { ROUTES_MAIN } from '@market-monitor/shared/data-access';
import { DefaultImgDirective, PositionColoringDirective, SectionTitleComponent } from '@market-monitor/shared/ui';

@Component({
  selector: 'app-hall-of-fame-groups',
  standalone: true,
  imports: [
    CommonModule,
    PortfolioRankTableComponent,
    DefaultImgDirective,
    SectionTitleComponent,
    MatButtonModule,
    MatIconModule,
    MatDialogModule,
    PositionColoringDirective,
    GroupDisplayItemComponent,
  ],
  template: `
    <div class="flex flex-col lg:flex-row gap-x-10 gap-y-4">
      @if (hallOfFameGroupsSignal(); as hallOfFameGroups) {
        <div class="lg:basis-4/6 xl:basis-3/6">
          <div class="flex items-center justify-between lg:px-2 mb-4">
            <!-- title -->
            <app-section-title title="Top Groups" class="mt-2" />

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
                {{ showBestSignal() ? 'Best Groups' : ' Worst Groups' }}
              </button>

              <!-- show more button -->
              <button
                *ngIf="showMoreButtonVisibleSignal()"
                (click)="showMoreToggle()"
                mat-stroked-button
                color="primary"
                type="button"
              >
                {{ showMoreSignal() ? 'Show Less' : ' Show More' }}
              </button>
            </div>
          </div>

          <!-- table -->
          <app-portfolio-rank-table
            (clickedItem)="onGroupClick($event)"
            [data]="displayPortfolioSignal()"
            [template]="userTemplate"
          />
        </div>
        <div class="p-4 lg:basis-2/6 xl:basis-3/6 grid xl:grid-cols-2 gap-y-10">
          <!-- daily best -->
          <div>
            <app-section-title title="Daily Gainers" class="mb-6" />
            @for (group of hallOfFameGroups.bestDailyGains; track group.id) {
              <app-group-display-item
                (click)="onGroupClick(group)"
                [groupData]="group"
                class="g-clickable-hover mb-3"
              />
            } @empty {
              <div>No Data Found</div>
            }
          </div>

          <!-- daily worst -->
          <div>
            <app-section-title title="Daily Losers" class="mb-6" />
            @for (group of hallOfFameGroups.worstDailyGains; track group.id) {
              <app-group-display-item
                (click)="onGroupClick(group)"
                [groupData]="group"
                class="g-clickable-hover mb-3"
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
        <img appDefaultImg [src]="data.imageUrl" alt="user image" class="w-10 h-10 rounded-lg" />
        <div class="grid">
          <div appPositionColoring [position]="position">{{ data.name }}</div>
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
export class HallOfFameGroupsComponent {
  private aggregationApiService = inject(AggregationApiService);
  private authenticationUserStoreService = inject(AuthenticationUserStoreService);
  private router = inject(Router);

  /**
   * limit number of groups to display, display rest on "show more"
   */
  private displayUsersLimit = 20;

  hallOfFameGroupsSignal = toSignal(this.aggregationApiService.getHallOfFameGroups());

  displayPortfolioSignal = computed(() => {
    const data = this.showBestSignal()
      ? this.hallOfFameGroupsSignal()?.bestPortfolio ?? []
      : this.hallOfFameGroupsSignal()?.worstPortfolio ?? [];
    return !this.showMoreSignal() ? data.slice(0, this.displayUsersLimit) : data;
  });

  showMoreButtonVisibleSignal = computed(
    () => (this.hallOfFameGroupsSignal()?.bestPortfolio?.length ?? 0) > this.displayUsersLimit,
  );
  /**
   * if true shows more groups, if false shows less groups
   */
  showMoreSignal = signal(false);

  /**
   * if true shows best groups, if false shows worst groups
   */
  showBestSignal = signal(true);

  showMoreToggle() {
    this.showMoreSignal.set(!this.showMoreSignal());
  }

  showBestToggle() {
    this.showBestSignal.set(!this.showBestSignal());
  }

  onGroupClick(group: GroupBase) {
    this.router.navigateByUrl(`/${ROUTES_MAIN.GROUPS}/${group.id}`);
  }
}
