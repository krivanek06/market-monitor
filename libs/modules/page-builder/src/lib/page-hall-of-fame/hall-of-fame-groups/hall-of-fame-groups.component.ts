import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
            </div>
          </div>

          <!-- table -->
          <app-general-card>
            <app-portfolio-rank-table
              (clickedItem)="onGroupClick($event)"
              [data]="displayPortfolioDataSignal()"
              [template]="userTemplate"
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
        <div class="p-4 lg:basis-2/6 xl:basis-3/6 gap-y-6 grid">
          <!-- daily best -->
          <div class="@container">
            <app-section-title title="Daily Gainers" class="mb-6" />
            <div class="grid @xl:grid-cols-2 gap-3">
              @for (group of hallOfFameGroups.bestDailyGains; track group.id) {
                <app-group-display-item
                  (click)="onGroupClick(group)"
                  [groupData]="group"
                  class="g-clickable-hover-color mb-1 rounded-lg p-2"
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
              @for (group of hallOfFameGroups.worstDailyGains; track group.id) {
                <app-group-display-item
                  (click)="onGroupClick(group)"
                  [groupData]="group"
                  class="g-clickable-hover-color mb-1 rounded-lg p-2"
                />
              } @empty {
                <div>No Data Found</div>
              }
            </div>
          </div>
        </div>
      }
    </div>

    <!-- template for user data in table -->
    <ng-template #userTemplate let-data="data" let-position="position">
      <div class="flex items-center gap-3">
        <img appDefaultImg [src]="data.item.imageUrl" alt="user image" class="w-10 h-10 rounded-lg" />
        <div class="flex items-center gap-2">
          <div appPositionColoring [position]="position">{{ data.item.name }}</div>
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
export class HallOfFameGroupsComponent {
  private aggregationApiService = inject(AggregationApiService);
  private router = inject(Router);

  /**
   * limit number of groups to display, display rest on "show more"
   */
  readonly displayGroupsLimit = 20;

  hallOfFameGroupsSignal = toSignal(this.aggregationApiService.getHallOfFameGroups());

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
