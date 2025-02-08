import { computed, inject, Injectable } from '@angular/core';
import { toObservable, toSignal } from '@angular/core/rxjs-interop';
import { OutstandingOrderApiService, UserApiService } from '@mm/api-client';
import { OUTSTANDING_ORDER_MAX_ALLOWED, OUTSTANDING_ORDERS_MAX_ORDERS, OutstandingOrder } from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import {
  checkTransactionOperationDataValidity,
  getCurrentDateDefaultFormat,
  roundNDigits,
} from '@mm/shared/general-util';
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
  private readonly outstandingOrderApiService = inject(OutstandingOrderApiService);
  private readonly userApiService = inject(UserApiService);

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

  resetTransactions(): void {
    const userData = this.authenticationUserService.state.getUserData();

    // remove orders
    this.outstandingOrderApiService.deleteAllOutstandingOrdersForUser(userData.id);

    // reset transactions
    this.userApiService.resetTransactions(userData);
  }

  createOrder(order: OutstandingOrder) {
    const userData = this.authenticationUserService.state.getUserData();
    const orders = this.authenticationUserService.state.outstandingOrders();

    // check if operation validity - throws error if invalid
    checkTransactionOperationDataValidity(userData.portfolioState, userData.holdingSnapshot.data, order);

    // prevent creating more orders than allowed
    if (orders.openOrders.length >= OUTSTANDING_ORDERS_MAX_ORDERS) {
      throw new Error(OUTSTANDING_ORDER_MAX_ALLOWED);
    }

    // save order
    this.outstandingOrderApiService.addOutstandingOrder(order);

    // what type of order is it
    const isBuy = order.orderType.type === 'BUY';
    const isSell = order.orderType.type === 'SELL';

    // subtract the cash from the user if BUY order
    const cashOnHand = isBuy
      ? roundNDigits(userData.portfolioState.cashOnHand - order.potentialTotalPrice)
      : userData.portfolioState.cashOnHand;

    // update holdings
    const holdings = userData.holdingSnapshot.data.map((holding) => ({
      ...holding,
      // remove owned units if SELL order
      units: holding.symbol === order.symbol && isSell ? holding.units - order.units : holding.units,
    }));

    // update user
    this.userApiService.updateUser(userData.id, {
      portfolioState: {
        ...userData.portfolioState,
        cashOnHand,
      },
      holdingSnapshot: {
        lastModifiedDate: getCurrentDateDefaultFormat(),
        data: holdings,
        symbols: holdings.map((h) => h.symbol),
      },
    });
  }

  deleteOrder(order: OutstandingOrder) {
    const userData = this.authenticationUserService.state.getUserData();

    // check if the user who creates the order is the same as the user in the order
    if (order.userData.id !== userData.id) {
      throw new Error('User does not have the order');
    }

    // save order
    this.outstandingOrderApiService.deleteOutstandingOrder(order);

    // what type of order is it
    const isBuy = order.orderType.type === 'BUY';
    const isSell = order.orderType.type === 'SELL';

    // add the cash back to the user if BUY order
    const cashOnHand = isBuy
      ? roundNDigits(userData.portfolioState.cashOnHand + order.potentialTotalPrice)
      : userData.portfolioState.cashOnHand;

    // update holdings - add back the units if SELL order
    const holdings = userData.holdingSnapshot.data.map((holding) => ({
      ...holding,
      units: holding.symbol === order.symbol && isSell ? holding.units + order.units : holding.units,
    }));

    // update user
    this.userApiService.updateUser(userData.id, {
      portfolioState: {
        ...userData.portfolioState,
        cashOnHand,
      },
      holdingSnapshot: {
        lastModifiedDate: getCurrentDateDefaultFormat(),
        data: holdings,
        symbols: holdings.map((h) => h.symbol),
      },
    });
  }
}
