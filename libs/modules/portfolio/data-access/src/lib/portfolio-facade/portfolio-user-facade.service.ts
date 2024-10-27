import { Injectable, computed, inject } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { OUTSTANDING_ORDERS_MAX_ORDERS, OutstandingOrder } from '@mm/api-types';
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
              this.authenticationUserService.state.getUserData().portfolioState,
              this.authenticationUserService.state.getUserData().holdingSnapshot.data,
            )
          : of(undefined),
      ),
    ),
  );

  /**
   * get portfolio state either saved from DB or recalculated from transactions
   */
  readonly portfolioState = computed(
    () => this.portfolioStateHolding() ?? this.authenticationUserService.state.getUserData().portfolioState,
  );

  /**
   * used to return growth for the entire portfolio
   */
  readonly portfolioGrowth = computed(() => this.authenticationUserService.state.portfolioGrowth());

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
    const userData = this.authenticationUserService.state.getUserData();
    const orders = this.authenticationUserService.state.outstandingOrders();

    // prevent creating more orders than allowed
    if (orders.openOrders.length >= OUTSTANDING_ORDERS_MAX_ORDERS) {
      throw new Error(`You can have maximum ${OUTSTANDING_ORDERS_MAX_ORDERS} outstanding orders`);
    }

    // create the order
    return this.portfolioCreateOperationService.createOrder(userData, data);
  }

  deleteOrder(order: OutstandingOrder) {
    const userData = this.authenticationUserService.state.getUserData();
    return this.portfolioCreateOperationService.deleteOrder(order, userData);
  }
}
