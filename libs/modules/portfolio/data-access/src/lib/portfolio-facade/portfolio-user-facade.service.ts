import { Injectable, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { PortfolioStateHolding } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { InputSource } from '@mm/shared/data-access';
import { combineLatest, from, of, switchMap } from 'rxjs';
import { PortfolioCalculationService } from '../portfolio-calculation/portfolio-calculation.service';

/**
 * service for authenticated user to perform portfolio operations
 */
@Injectable({
  providedIn: 'root',
})
export class PortfolioUserFacadeService {
  private authenticationUserService = inject(AuthenticationUserStoreService);
  private portfolioCalculationService = inject(PortfolioCalculationService);

  getPortfolioState = toSignal(
    combineLatest([
      toObservable(this.authenticationUserService.state.getUserPortfolioTransactions),
      toObservable(this.authenticationUserService.state.getPortfolioState),
    ]).pipe(
      switchMap(([transactions, portfolioState]) =>
        portfolioState
          ? this.portfolioCalculationService.getPortfolioStateHoldings(transactions ?? [], portfolioState)
          : of(undefined),
      ),
    ),
  );

  getPortfolioStateHolding = (symbol: string) =>
    computed(() => this.getPortfolioState()?.holdings.find((holding) => holding.symbol === symbol));

  /**
   * method used to return growth for each asset based on the dates owned.
   */
  getPortfolioGrowthAssets = toSignal(
    toObservable(this.authenticationUserService.state.getUserPortfolioTransactions).pipe(
      switchMap((transactions) =>
        transactions ? from(this.portfolioCalculationService.getPortfolioGrowthAssets(transactions)) : of(undefined),
      ),
    ),
  );

  /**
   * method used to return growth for the entire portfolio
   */
  getPortfolioGrowth = computed(() => {
    const growth = this.getPortfolioGrowthAssets();

    return growth
      ? this.portfolioCalculationService.getPortfolioGrowth(growth, this.getPortfolioState()?.startingCash)
      : null;
  });

  /**
   * method used to return change for the entire portfolio
   */
  getPortfolioChange = computed(() =>
    this.portfolioCalculationService.getPortfolioChange(this.getPortfolioGrowth() ?? []),
  );

  getPortfolioSectorAllocationPieChart = computed(() =>
    this.portfolioCalculationService.getPortfolioSectorAllocationPieChart(this.getPortfolioState()?.holdings ?? []),
  );

  getPortfolioAssetAllocationPieChart = computed(() =>
    this.portfolioCalculationService.getPortfolioAssetAllocationPieChart(this.getPortfolioState()?.holdings ?? []),
  );

  getPortfolioTransactionToDate = computed(() => {
    const transactions = this.authenticationUserService.state.getUserPortfolioTransactions();
    return this.portfolioCalculationService.getPortfolioTransactionToDate(transactions ?? []);
  });

  getHoldingsInputSource = computed(() => {
    return (
      this.getPortfolioState()?.holdings?.map(
        (holding) =>
          ({
            value: holding,
            caption: `${holding.symbolSummary.quote.name}`,
            image: holding.symbolSummary.id,
          }) satisfies InputSource<PortfolioStateHolding>,
      ) ?? []
    );
  });
}
