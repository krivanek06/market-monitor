import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { AggregationApiService } from '@mm/api-client';
import { GroupBase } from '@mm/api-types';
import { GroupDisplayItemComponent } from '@mm/group/ui';
import { PortfolioRankTableComponent } from '@mm/portfolio/ui';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import {
  DefaultImgDirective,
  GeneralCardComponent,
  PositionColoringDirective,
  RangeDirective,
  SectionTitleComponent,
  ShowMoreButtonComponent,
} from '@mm/shared/ui';

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
    GeneralCardComponent,
    ShowMoreButtonComponent,
    RangeDirective,
  ],
  template: `
    <div class="flex flex-col gap-x-10 gap-y-4 lg:flex-row">
      <div class="lg:basis-4/6 xl:basis-3/6">
        <div class="mb-4 flex items-center justify-between lg:px-2">
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
          </div>
        </div>

        <!-- table -->
        <app-general-card>
          <app-portfolio-rank-table
            (clickedItem)="onGroupClick($event)"
            [data]="displayPortfolioDataSignal()"
            [template]="groupTemplate"
          />

          <!-- show more button -->
          <div class="flex justify-end">
            <app-show-more-button
              [itemsTotal]="displayPortfolioSignal().length"
              [itemsLimit]="displayGroupsLimit"
              [(showMoreToggle)]="showMoreSignal"
            />
          </div>
        </app-general-card>
      </div>
      <div class="grid gap-y-6 p-4 lg:basis-2/6 xl:basis-3/6">
        <!-- daily best -->
        <div class="@container">
          <app-section-title title="Daily Gainers" class="mb-6" />
          <div class="@xl:grid-cols-2 grid gap-3">
            @if (hallOfFameGroupsSignal(); as hallOfFameGroups) {
              @for (group of hallOfFameGroups.bestDailyGains; track group.id) {
                <app-group-display-item
                  (itemClicked)="onGroupClick(group)"
                  [clickable]="true"
                  [showDailyPortfolioChange]="true"
                  [groupData]="group"
                  class="mb-1 rounded-lg p-2"
                />
              } @empty {
                <div class="@xl:col-span-2">No Data Found</div>
              }
            } @else {
              <div *ngRange="10" class="g-skeleton h-16"></div>
            }
          </div>
        </div>

        <!-- daily worst -->
        <div class="@container">
          <app-section-title title="Daily Losers" class="mb-6" />
          <div class="@xl:grid-cols-2 grid gap-3">
            @if (hallOfFameGroupsSignal(); as hallOfFameGroups) {
              @for (group of hallOfFameGroups.worstDailyGains; track group.id) {
                <app-group-display-item
                  (itemClicked)="onGroupClick(group)"
                  [clickable]="true"
                  [showDailyPortfolioChange]="true"
                  [groupData]="group"
                  class="mb-1 rounded-lg p-2"
                />
              } @empty {
                <div>No Data Found</div>
              }
            } @else {
              <div *ngRange="10" class="g-skeleton h-16"></div>
            }
          </div>
        </div>
      </div>
    </div>

    <!-- template for user data in table -->
    <ng-template #groupTemplate let-data="data" let-position="position">
      <div class="flex items-center gap-3">
        <img appDefaultImg [src]="data.item.imageUrl" alt="user image" class="h-10 w-10 rounded-lg" />
        <div class="flex items-center gap-2">
          <div appPositionColoring [position]="position" class="w-[200px] truncate text-ellipsis">
            {{ data.item.name }}
          </div>
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
export class HallOfFameGroupsComponent {
  private aggregationApiService = inject(AggregationApiService);
  private router = inject(Router);

  /**
   * limit number of groups to display, display rest on "show more"
   */
  readonly displayGroupsLimit = 20;

  hallOfFameGroupsSignal = this.aggregationApiService.hallOfFameGroups;

  displayPortfolioSignal = computed(() =>
    this.showBestSignal()
      ? this.hallOfFameGroupsSignal()?.bestPortfolio ?? []
      : this.hallOfFameGroupsSignal()?.worstPortfolio ?? [],
  );

  displayPortfolioDataSignal = computed(() =>
    this.showMoreSignal()
      ? this.displayPortfolioSignal()
      : this.displayPortfolioSignal().slice(0, this.displayGroupsLimit),
  );

  /**
   * if true shows more groups, if false shows less groups
   */
  showMoreSignal = signal(false);

  /**
   * if true shows best groups, if false shows worst groups
   */
  showBestSignal = signal(true);

  showBestToggle() {
    this.showBestSignal.set(!this.showBestSignal());
  }

  onGroupClick(group: GroupBase) {
    this.router.navigateByUrl(`/${ROUTES_MAIN.GROUPS}/${group.id}`);
  }
}
