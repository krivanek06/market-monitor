import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import { PortfolioCalculationService } from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioTransactionChartComponent,
  PortfolioTransactionsTableComponent,
} from '@market-monitor/modules/portfolio/ui';
import {
  GeneralCardComponent,
  GenericChartComponent,
  SectionTitleComponent,
  SortByKeyPipe,
} from '@market-monitor/shared/ui';
import { PageGroupsBaseComponent } from '../page-groups-base.component';

@Component({
  selector: 'app-group-details-holdings',
  standalone: true,
  imports: [
    CommonModule,
    GenericChartComponent,
    GeneralCardComponent,
    MatDialogModule,
    StockSummaryDialogComponent,
    PortfolioTransactionChartComponent,
    SectionTitleComponent,
    PortfolioTransactionsTableComponent,
    SortByKeyPipe,
  ],
  template: `
    <ng-container *ngIf="groupDetailsSignal() as groupDetailsSignal">
      <div class="grid mb-8 2xl:grid-cols-3">
        <div class="2xl:col-span-2">
          <app-generic-chart
            *ngIf="portfolioHoldingBubbleChartSignal() as portfolioHoldingBubbleChart"
            [heightPx]="380"
            [series]="portfolioHoldingBubbleChart"
          ></app-generic-chart>
        </div>
        <div class="hidden 2xl:block">
          <app-generic-chart
            *ngIf="portfolioSectorAllocationSignal() as portfolioSectorAllocation"
            [heightPx]="380"
            chartTitle="Sector Allocation"
            [showDataLabel]="true"
            chartTitlePosition="center"
            [series]="[portfolioSectorAllocation]"
          ></app-generic-chart>
        </div>
      </div>

      <!-- transaction chart -->
      <div class="mb-6">
        <app-section-title title="Last Transactions" matIcon="history" />
        <app-portfolio-transaction-chart
          [data]="groupDetailsSignal.groupPortfolioSnapshotsData"
        ></app-portfolio-transaction-chart>
      </div>

      <!-- transactions -->
      <div>
        <app-section-title title="Transaction History" matIcon="history" additionalClasses="pl-1 mb-3" />
        <app-portfolio-transactions-table
          [showTransactionFees]="true"
          [showUser]="true"
          [data]="groupDetailsSignal.groupTransactionsData | sortByKey: 'date' : 'desc'"
        ></app-portfolio-transactions-table>
      </div>
    </ng-container>
  `,
  styles: `
      :host {
        display: block;
      }
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetailsHoldingsComponent extends PageGroupsBaseComponent {
  portfolioCalculationService = inject(PortfolioCalculationService);

  portfolioSectorAllocationSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioSectorAllocationPieChart(this.getGroupHoldingsSignal()),
  );

  portfolioHoldingBubbleChartSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioHoldingBubbleChart(this.getGroupHoldingsSignal()),
  );
}
