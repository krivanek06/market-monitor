import { CommonModule } from '@angular/common';
import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { MatDialogModule } from '@angular/material/dialog';
import { StockSummaryDialogComponent } from '@market-monitor/modules/market-stocks/features';
import { PortfolioCalculationService } from '@market-monitor/modules/portfolio/data-access';
import {
  PortfolioHoldingsTableComponent,
  PortfolioTransactionChartComponent,
} from '@market-monitor/modules/portfolio/ui';
import { GeneralCardComponent, GenericChartBubbleComponent, GenericChartComponent } from '@market-monitor/shared/ui';
import { SCREEN_DIALOGS } from '@market-monitor/shared/utils-client';
import { map } from 'rxjs';
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
  ],
  templateUrl: './group-details-holdings.component.html',
  styles: [
    `
      :host {
        display: block;
      }
    `,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class GroupDetailsHoldingsComponent extends PageGroupsBaseComponent {
  portfolioCalculationService = inject(PortfolioCalculationService);
  portfolioSectorAllocationSignal = toSignal(
    this.groupDetails$.pipe(
      map((groupDetails) =>
        this.portfolioCalculationService.getPortfolioSectorAllocationPieChart(groupDetails.groupHoldingSnapshotsData),
      ),
    ),
  );
  portfolioHoldingBubbleChartSignal = toSignal(
    this.groupDetails$.pipe(
      map((groupDetails) =>
        this.portfolioCalculationService.getPortfolioHoldingBubbleChart(groupDetails.groupHoldingSnapshotsData),
      ),
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
