import { Injectable, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { UserApiService } from '@mm/api-client';
import { PortfolioTransaction, PortfolioTransactionCreate } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { of, switchMap } from 'rxjs';
import { PortfolioCalculationService } from '../portfolio-calculation/portfolio-calculation.service';
import { PortfolioCreateOperationService } from '../portfolio-create-operation/portfolio-create-operation.service';

/**
 * service for authenticated user to perform portfolio operations
 */
@Injectable({
  providedIn: 'root',
})
export class PortfolioUserFacadeService {
  private readonly authenticationUserService = inject(AuthenticationUserStoreService);
  private readonly portfolioCalculationService = inject(PortfolioCalculationService);
  private readonly portfolioCreateOperationService = inject(PortfolioCreateOperationService);
  private readonly userApiService = inject(UserApiService);

  readonly getPortfolioState = toSignal(
    toObservable(this.authenticationUserService.state.getUserPortfolioTransactions).pipe(
      switchMap((transactions) =>
        transactions
          ? this.portfolioCalculationService.getPortfolioStateHoldings(
              this.authenticationUserService.state.getUserData().portfolioState.startingCash,
              transactions,
            )
          : of(undefined),
      ),
    ),
  );

  /**
   * used to return growth for the entire portfolio
   */
  readonly getPortfolioGrowth = this.authenticationUserService.state.portfolioGrowth;

  /**
   * get distinct symbols from the portfolio transactions
   */
  readonly transactedSymbols = computed(() => {
    const transactions = this.authenticationUserService.state.getUserPortfolioTransactions();
    return this.portfolioCalculationService.getTransactionSymbols(transactions ?? []);
  });

  /**
   * method used to return change for the entire portfolio
   */
  readonly getPortfolioChange = computed(() =>
    this.portfolioCalculationService.getPortfolioChange(this.getPortfolioGrowth() ?? []),
  );

  readonly getPortfolioSectorAllocationPieChart = computed(() =>
    this.portfolioCalculationService.getPortfolioSectorAllocationPieChart(this.getPortfolioState()?.holdings ?? []),
  );

  readonly getPortfolioAssetAllocationPieChart = computed(() =>
    this.portfolioCalculationService.getPortfolioAssetAllocationPieChart(this.getPortfolioState()?.holdings ?? []),
  );

  createPortfolioOperation(data: PortfolioTransactionCreate): Promise<PortfolioTransaction> {
    const userData = this.authenticationUserService.state.getUserData();
    return this.portfolioCreateOperationService.createPortfolioCreateOperation(userData, data);
  }

  deletePortfolioOperation(transaction: PortfolioTransaction): void {
    const userData = this.authenticationUserService.state.getUserData();
    this.userApiService.deletePortfolioTransactionForUser(userData.id, transaction);
  }
}
