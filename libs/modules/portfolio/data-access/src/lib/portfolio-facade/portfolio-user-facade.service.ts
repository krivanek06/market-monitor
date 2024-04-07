import { Injectable, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { UserApiService } from '@mm/api-client';
import { PortfolioStateHolding, PortfolioTransaction, PortfolioTransactionCreate } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { InputSource } from '@mm/shared/data-access';
import { distinctUntilChanged, from, of, switchMap } from 'rxjs';
import { PortfolioCalculationService } from '../portfolio-calculation/portfolio-calculation.service';
import { PortfolioCreateOperationService } from '../portfolio-create-operation/portfolio-create-operation.service';

/**
 * service for authenticated user to perform portfolio operations
 */
@Injectable({
  providedIn: 'root',
})
export class PortfolioUserFacadeService {
  private authenticationUserService = inject(AuthenticationUserStoreService);
  private portfolioCalculationService = inject(PortfolioCalculationService);
  private portfolioCreateOperationService = inject(PortfolioCreateOperationService);
  private userApiService = inject(UserApiService);

  getPortfolioState = toSignal(
    toObservable(this.authenticationUserService.state.getUserDataNormal).pipe(
      // prevent execution if not portfolio state is changed
      distinctUntilChanged((prev, curr) => prev?.portfolioState.balance === curr?.portfolioState.balance),
      switchMap((userData) =>
        userData
          ? this.portfolioCalculationService.getPortfolioStateHoldings(
              userData.portfolioState,
              userData.holdingSnapshot.data,
            )
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

  createPortfolioOperation(data: PortfolioTransactionCreate): Promise<PortfolioTransaction> {
    const userData = this.authenticationUserService.state.getUserData();
    return this.portfolioCreateOperationService.createPortfolioCreateOperation(userData, data);
  }

  deletePortfolioOperation(transaction: PortfolioTransaction): void {
    const userData = this.authenticationUserService.state.getUserData();
    this.userApiService.deletePortfolioTransactionForUser(userData.id, transaction);
  }
}
