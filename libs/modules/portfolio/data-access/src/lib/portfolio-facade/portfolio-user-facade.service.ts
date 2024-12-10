import { computed, inject, Injectable } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { OUTSTANDING_ORDER_MAX_ALLOWED, OUTSTANDING_ORDERS_MAX_ORDERS, OutstandingOrder } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { checkTransactionOperationDataValidity } from '@mm/shared/general-util';
import { of, switchMap } from 'rxjs';
import { PortfolioCalculationService } from '../portfolio-calculation/portfolio-calculation.service';

/**
 * service for authenticated user to perform portfolio operations
 */
@Injectable({
  providedIn: 'root',
})
export class PortfolioUserFacadeService {
  private readonly authenticationUserService = inject(AuthenticationUserStoreService);
  private readonly portfolioCalculationService = inject(PortfolioCalculationService);

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

  createOrder(order: OutstandingOrder) {
    const userData = this.authenticationUserService.state.getUserData();
    const orders = this.authenticationUserService.state.outstandingOrders();

    // check if operation validity - throws error if invalid
    checkTransactionOperationDataValidity(userData, order);

    // prevent creating more orders than allowed
    if (orders.openOrders.length >= OUTSTANDING_ORDERS_MAX_ORDERS) {
      throw new Error(OUTSTANDING_ORDER_MAX_ALLOWED);
    }

    this.authenticationUserService.addOutstandingOrder(order);

    return order;
  }

  deleteOrder(order: OutstandingOrder) {
    const userData = this.authenticationUserService.state.getUserData();

    // check if the user who creates the order is the same as the user in the order
    if (order.userData.id !== userData.id) {
      throw new Error('User does not have the order');
    }

    // delete the order
    this.authenticationUserService.removeOutstandingOrder(order);
  }
}
