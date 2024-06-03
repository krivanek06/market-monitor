import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { EnterpriseValue, SymbolOwnershipInstitutional } from '@mm/api-types';
import { LargeNumberFormatterPipe, PercentageIncreaseDirective } from '@mm/shared/ui';

@Component({
  selector: 'app-stock-ownership-institutional-list',
  standalone: true,
  imports: [CommonModule, PercentageIncreaseDirective, LargeNumberFormatterPipe],
  template: `
    <!-- institutional data -->
    <ng-container *ngIf="displayType() === 'institution'">
      <div>
        <div class="g-item-wrapper">
          <div>Total Invested</div>
          <div *ngIf="!isLoading() && ownershipInstitutional()" class="flex items-center gap-2">
            <span>{{ ownershipInstitutional().totalInvested | largeNumberFormatter }}</span>
            <span
              appPercentageIncrease
              [currentValues]="{
                value: ownershipInstitutional().totalInvested,
                valueToCompare: ownershipInstitutional().lastTotalInvested,
                hideValue: true,
              }"
            ></span>
            <span *ngIf="enterpriseValue()">/</span>
            <span *ngIf="enterpriseValue()">{{ enterpriseValue().marketCapitalization | largeNumberFormatter }}</span>
          </div>
          <!-- loading -->
          <div *ngIf="isLoading()" class="g-skeleton c-loading-wrapper"></div>
        </div>

        <div class="g-item-wrapper">
          <div>Held Shares</div>
          <div *ngIf="!isLoading() && ownershipInstitutional()" class="flex items-center gap-2">
            <span>{{ ownershipInstitutional().numberOf13Fshares | largeNumberFormatter }}</span>
            <span
              appPercentageIncrease
              [currentValues]="{
                value: ownershipInstitutional().numberOf13Fshares,
                valueToCompare: ownershipInstitutional().lastNumberOf13Fshares,
                hideValue: true,
              }"
            ></span>
            <span *ngIf="enterpriseValue()">/</span>
            <span *ngIf="enterpriseValue()">{{ enterpriseValue().numberOfShares | largeNumberFormatter }}</span>
          </div>

          <!-- loading -->
          <div *ngIf="isLoading()" class="g-skeleton c-loading-wrapper"></div>
        </div>

        <div class="g-item-wrapper">
          <div>Ownership</div>
          <div *ngIf="!isLoading() && ownershipInstitutional()" class="flex items-center gap-2">
            <span>{{ ownershipInstitutional().ownershipPercent | largeNumberFormatter }}%</span>
            <span
              appPercentageIncrease
              [currentValues]="{
                value: ownershipInstitutional().ownershipPercent,
                valueToCompare: ownershipInstitutional().lastOwnershipPercent,
                hideValue: true,
              }"
            ></span>
          </div>

          <!-- loading -->
          <div *ngIf="isLoading()" class="g-skeleton c-loading-wrapper"></div>
        </div>

        <div class="g-item-wrapper">
          <div>Investors</div>
          <div *ngIf="!isLoading() && ownershipInstitutional()" class="flex items-center gap-2">
            <span>{{ ownershipInstitutional().investorsHolding }}</span>
            <span
              appPercentageIncrease
              [currentValues]="{
                value: ownershipInstitutional().investorsHolding,
                valueToCompare: ownershipInstitutional().lastInvestorsHolding,
                hideValue: true,
              }"
            ></span>
          </div>

          <!-- loading -->
          <div *ngIf="isLoading()" class="g-skeleton c-loading-wrapper"></div>
        </div>
      </div>
    </ng-container>

    <!-- positions -->
    <ng-container *ngIf="displayType() === 'position'">
      <div>
        <!-- line 1 -->
        <div class="g-item-wrapper">
          <div>Increased</div>
          <div *ngIf="!isLoading() && ownershipInstitutional()" class="flex items-center gap-2">
            <span>{{ ownershipInstitutional().increasedPositions }}</span>
            <span
              appPercentageIncrease
              [currentValues]="{
                value: ownershipInstitutional().increasedPositions,
                valueToCompare: ownershipInstitutional().lastIncreasedPositions,
                hideValue: true,
              }"
            ></span>
          </div>

          <!-- loading -->
          <div *ngIf="isLoading()" class="g-skeleton c-loading-wrapper"></div>
        </div>

        <!-- line 2-->
        <div class="g-item-wrapper">
          <div>Decreased</div>
          <div *ngIf="!isLoading() && ownershipInstitutional()" class="flex items-center gap-2">
            <span>{{ ownershipInstitutional().reducedPositions }}</span>
            <span
              appPercentageIncrease
              [currentValues]="{
                value: ownershipInstitutional().reducedPositions,
                valueToCompare: ownershipInstitutional().lastReducedPositions,
                hideValue: true,
              }"
            ></span>
          </div>

          <!-- loading -->
          <div *ngIf="isLoading()" class="g-skeleton c-loading-wrapper"></div>
        </div>

        <div class="g-item-wrapper">
          <div>New</div>
          <div *ngIf="!isLoading() && ownershipInstitutional()" class="flex items-center gap-2">
            <span>{{ ownershipInstitutional().newPositions }}</span>
            <span
              appPercentageIncrease
              [currentValues]="{
                value: ownershipInstitutional().newPositions,
                valueToCompare: ownershipInstitutional().lastNewPositions,
                hideValue: true,
              }"
            ></span>
          </div>

          <!-- loading -->
          <div *ngIf="isLoading()" class="g-skeleton c-loading-wrapper"></div>
        </div>

        <div class="g-item-wrapper">
          <div>Sold</div>
          <div *ngIf="!isLoading() && ownershipInstitutional()" class="flex items-center gap-2">
            <span>{{ ownershipInstitutional().closedPositions }}</span>
            <span
              appPercentageIncrease
              [currentValues]="{
                value: ownershipInstitutional().closedPositions,
                valueToCompare: ownershipInstitutional().lastClosedPositions,
                hideValue: true,
              }"
            ></span>
          </div>

          <!-- loading -->
          <div *ngIf="isLoading()" class="g-skeleton c-loading-wrapper"></div>
        </div>
      </div>
    </ng-container>

    <!-- Options -->
    <ng-container *ngIf="displayType() === 'option'">
      <div>
        <div class="g-item-wrapper">
          <div>Calls</div>
          <div *ngIf="!isLoading() && ownershipInstitutional()" class="flex items-center gap-2">
            <span>{{ ownershipInstitutional().totalCalls | largeNumberFormatter }}</span>
            <span
              appPercentageIncrease
              [currentValues]="{
                value: ownershipInstitutional().totalCalls,
                valueToCompare: ownershipInstitutional().lastTotalCalls,
                hideValue: false,
              }"
            ></span>
          </div>
          <!-- loading -->
          <div *ngIf="isLoading()" class="g-skeleton c-loading-wrapper"></div>
        </div>

        <div class="g-item-wrapper">
          <div>Puts</div>
          <div *ngIf="!isLoading() && ownershipInstitutional()" class="flex items-center gap-2">
            <span>{{ ownershipInstitutional().totalPuts | largeNumberFormatter }}</span>
            <span
              appPercentageIncrease
              [currentValues]="{
                value: ownershipInstitutional().totalPuts,
                valueToCompare: ownershipInstitutional().lastTotalPuts,
                hideValue: false,
              }"
            ></span>
          </div>
          <!-- loading -->
          <div *ngIf="isLoading()" class="g-skeleton c-loading-wrapper"></div>
        </div>

        <div class="g-item-wrapper">
          <div>Put/Call Ratio</div>
          <div *ngIf="!isLoading() && ownershipInstitutional()" class="flex items-center gap-2">
            <span>{{ ownershipInstitutional().putCallRatio | largeNumberFormatter }}</span>
            <span
              appPercentageIncrease
              [currentValues]="{
                value: ownershipInstitutional().putCallRatio,
                valueToCompare: ownershipInstitutional().lastPutCallRatio,
                hideValue: true,
              }"
            ></span>
          </div>
          <!-- loading -->
          <div *ngIf="isLoading()" class="g-skeleton c-loading-wrapper"></div>
        </div>
      </div>
    </ng-container>
  `,
  styles: `
    :host {
      display: block;
    }

    .c-loading-wrapper {
      width: 45%;
      margin-right: 24px;
      height: 28px;
    }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class StockOwnershipInstitutionalListComponent {
  /**
   * both inputs are associated with the same quarterly data
   */
  ownershipInstitutional = input.required<SymbolOwnershipInstitutional>();
  enterpriseValue = input.required<EnterpriseValue>();
  isLoading = input(false);
  displayType = input<'institution' | 'position' | 'option'>('institution');
}
