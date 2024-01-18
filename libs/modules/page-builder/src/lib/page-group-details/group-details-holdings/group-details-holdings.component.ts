import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { MatDialogModule } from '@angular/material/dialog';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import { PortfolioCalculationService } from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioHoldingsTableComponent,
  PortfolioTransactionChartComponent,
} from '@market-monitor/modules/portfolio/ui';
import { SCREEN_DIALOGS } from '@market-monitor/shared/features/dialog-manager';
import {
  GeneralCardComponent,
  GenericChartBubbleComponent,
  GenericChartComponent,
  SectionTitleComponent,
} from '@market-monitor/shared/ui';
import { PageGroupsBaseComponent } from '../page-groups-base.component';

@Component({
  selector: 'app-group-details-holdings',
  standalone: true,
  imports: [
    CommonModule,
    GenericChartComponent,
    GeneralCardComponent,
    PortfolioHoldingsTableComponent,
    MatDialogModule,
    StockSummaryDialogComponent,
    GenericChartBubbleComponent,
    PortfolioTransactionChartComponent,
    SectionTitleComponent,
  ],
  template: `
    <ng-container *ngIf="groupDetailsSignal() as groupDetailsSignal">
      <div class="grid mb-8 2xl:grid-cols-3">
        <div class="2xl:col-span-2">
          <app-generic-chart-bubble
            *ngIf="portfolioHoldingBubbleChartSignal() as portfolioHoldingBubbleChart"
            [data]="portfolioHoldingBubbleChart"
          ></app-generic-chart-bubble>
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

      <!-- holding table -->
      <div class="">
        <app-general-card title="Holdings" titleScale="large" matIcon="show_chart">
          <app-portfolio-holdings-table
            (symbolClicked)="onSummaryClick($event)"
            [holdings]="groupDetailsSignal.groupHoldingSnapshotsData"
            [holdingsBalance]="groupDetailsSignal.groupData.portfolioState.holdingsBalance"
          ></app-portfolio-holdings-table>
        </app-general-card>
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
    this.portfolioCalculationService.getPortfolioSectorAllocationPieChart(
      this.groupDetailsSignal()?.groupHoldingSnapshotsData ?? [],
    ),
  );

  portfolioHoldingBubbleChartSignal = computed(() =>
    this.portfolioCalculationService.getPortfolioHoldingBubbleChart(
      this.groupDetailsSignal()?.groupHoldingSnapshotsData ?? [],
    ),
  );

  onSummaryClick(symbol: string) {
    this.dialog.open(StockSummaryDialogComponent, {
      data: {
        symbol: symbol,
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  }
}
