import { Injectable, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { OutstandingOrder } from '@mm/api-types';
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

  /**
   * on every transaction change, recalculate the portfolio state
   * however listen on the userState to get current data - like cashOnHand (for outstanding orders)
   */
  readonly portfolioStateHolding = toSignal(
    toObservable(this.authenticationUserService.state.userData).pipe(
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

  /**
   * used to return growth for the entire portfolio
   */
  readonly portfolioGrowth = computed(() => this.authenticationUserService.state.portfolioGrowth());

  /**
   * get all distinct symbols from the portfolio transactions that every been transacted
   */
  readonly transactedSymbols = computed(() => {
    const transactions = this.authenticationUserService.state.getUserPortfolioTransactions();
    return this.portfolioCalculationService.getTransactionSymbols(transactions ?? []);
  });

  /**
   * method used to return change for the entire portfolio
   */
  readonly portfolioChange = computed(() =>
    this.portfolioCalculationService.getPortfolioChange(this.portfolioGrowth() ?? []),
  );

  readonly portfolioSectorAllocationPieChart = computed(() =>
    this.portfolioCalculationService.getPortfolioSectorAllocationPieChart(this.portfolioStateHolding()?.holdings ?? []),
  );

  readonly portfolioAssetAllocationPieChart = computed(() =>
    this.portfolioCalculationService.getPortfolioAssetAllocationPieChart(this.portfolioStateHolding()?.holdings ?? []),
  );

  createOrder(data: OutstandingOrder) {
    return this.portfolioCreateOperationService.createOrder(data);
  }

  deleteOrder(order: OutstandingOrder) {
    return this.portfolioCreateOperationService.deleteOrder(order);
  }
}
