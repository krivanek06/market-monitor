import { Injectable, computed } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PortfolioTransaction, PortfolioTransactionCreate } from '@market-monitor/api-types';
import { AuthenticationUserStoreService } from '@market-monitor/modules/authentication/data-access';
import { from, of, switchMap } from 'rxjs';
import { PortfolioCalculationService } from '../portfolio-calculation/portfolio-calculation.service';
import { PortfolioGrowthService } from '../portfolio-growth/portfolio-growth.service';

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
    private portfolioCalculationService: PortfolioCalculationService,
  ) {}

  getPortfolioState = toSignal(
    toObservable(this.authenticationUserService.state.getUserPortfolioTransactions).pipe(
      switchMap((transactions) =>
        this.authenticationUserService.state.userData()
          ? this.portfolioGrowthService.getPortfolioStateHoldings(
              transactions,
              this.authenticationUserService.state.getUserData().portfolioState,
            )
          : of(undefined),
      ),
    ),
  );

  getPortfolioStateHolding = (symbol: string) =>
    computed(() => this.getPortfolioState()?.holdings.find((holding) => holding.symbol === symbol));

  getPortfolioGrowthAssets = toSignal(
    toObservable(this.authenticationUserService.state.getUserPortfolioTransactions).pipe(
      switchMap((transactions) => from(this.portfolioGrowthService.getPortfolioGrowthAssets(transactions))),
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
    return this.authenticationUserService.createPortfolioTransactionForUser(input);
  }

  deleteTransactionOperation(transaction: PortfolioTransaction): void {
    this.authenticationUserService.deletePortfolioTransactionForUser(transaction);
  }
}
