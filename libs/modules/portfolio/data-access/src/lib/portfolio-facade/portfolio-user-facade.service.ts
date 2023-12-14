import { Injectable, computed } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { PortfolioTransaction } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { from } from 'rxjs';
import { PortfolioTransactionCreate } from '../models';
import { PortfolioCalculationService } from '../portfolio-calculation/portfolio-calculation.service';
import { PortfolioGrowthService } from '../portfolio-growth/portfolio-growth.service';
import { PortfolioOperationsService } from '../portfolio-operations/portfolio-operations.service';

/**
 * service for authenticated user to perform portfolio operations
 */
@Injectable({
  providedIn: 'root',
})
export class PortfolioUserFacadeService {
  constructor(
    private authenticationUserService: AuthenticationUserStoreService,
    private portfolioGrowthService: PortfolioGrowthService,
    private portfolioOperationsService: PortfolioOperationsService,
    private portfolioCalculationService: PortfolioCalculationService,
  ) {}

  getPortfolioState = toSignal(
    this.portfolioGrowthService.getPortfolioStateHoldings(
      this.authenticationUserService.state.getUserPortfolioTransactions(),
      this.authenticationUserService.state.userData()?.portfolioState.startingCash,
    ),
    { initialValue: null },
  );

  getPortfolioStateHolding = (symbol: string) =>
    computed(() => this.getPortfolioState()?.holdings.find((holding) => holding.symbol === symbol));

  getPortfolioGrowthAssets = toSignal(
    from(
      this.portfolioGrowthService.getPortfolioGrowthAssets(
        this.authenticationUserService.state().portfolioTransactions,
      ),
    ),
    { initialValue: [] },
  );
  getPortfolioGrowth = computed(() =>
    this.portfolioCalculationService.getPortfolioGrowth(
      this.getPortfolioGrowthAssets(),
      this.getPortfolioState()?.startingCash,
    ),
  );

  getPortfolioChange = computed(() => this.portfolioCalculationService.getPortfolioChange(this.getPortfolioGrowth()));

  getPortfolioSectorAllocationPieChart = computed(() =>
    this.portfolioCalculationService.getPortfolioSectorAllocationPieChart(this.getPortfolioState()?.holdings ?? []),
  );

  getPortfolioAssetAllocationPieChart = computed(() =>
    this.portfolioCalculationService.getPortfolioAssetAllocationPieChart(this.getPortfolioState()?.holdings ?? []),
  );

  getPortfolioTransactionToDate = computed(() => {
    const transactions = this.authenticationUserService.state().portfolioTransactions;
    return this.portfolioCalculationService.getPortfolioTransactionToDate(transactions);
  });

  createTransactionOperation(input: PortfolioTransactionCreate): Promise<PortfolioTransaction> {
    return this.portfolioOperationsService.createTransactionOperation(input);
  }

  deleteTransactionOperation(transaction: PortfolioTransaction): void {
    this.portfolioOperationsService.deleteTransactionOperation(transaction);
  }
}
