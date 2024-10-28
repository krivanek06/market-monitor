import { Injectable, inject } from '@angular/core';
import { MarketApiService, OutstandingOrderApiService, UserApiService } from '@mm/api-client';
import {
  DATE_TOO_OLD,
  HISTORICAL_PRICE_RESTRICTION_YEARS,
  OutstandingOrder,
  PortfolioTransaction,
  TRANSACTION_INPUT_UNITS_INTEGER,
  TRANSACTION_INPUT_UNITS_POSITIVE,
  USER_HOLDINGS_SYMBOL_LIMIT,
  USER_HOLDING_LIMIT_ERROR,
  USER_NOT_ENOUGH_CASH_ERROR,
  USER_NOT_UNITS_ON_HAND_ERROR,
  UserAccountEnum,
  UserBaseMin,
  UserData,
} from '@mm/api-types';
import { createTransaction, dateGetDetailsInformationFromDate } from '@mm/shared/general-util';

@Injectable({
  providedIn: 'root',
})
export class PortfolioCreateOperationService {
  private readonly userApiService = inject(UserApiService);
  private readonly marketApiService = inject(MarketApiService);
  private readonly outstandingOrdersApiService = inject(OutstandingOrderApiService);

  /**
   * either creates an order if normal (buy/sell) operation is issued and market is open,
   * or creates an outstanding order if the market is closed or limit, stop order, shorting is issued
   *
   * @param userData - user who creates the order (most likely authenticated user)
   * @param data - create transaction data
   */
  createOrder(
    userData: UserData,
    order: OutstandingOrder,
  ):
    | {
        type: 'order';
        data: OutstandingOrder;
      }
    | {
        type: 'transaction';
        data: PortfolioTransaction;
      } {
    // check if the user who creates the order is the same as the user in the order
    if (order.userData.id !== userData.id) {
      throw new Error('User does not have the order');
    }

    // only allow demo trading users to create orders
    if (userData.userAccountType !== UserAccountEnum.DEMO_TRADING) {
      throw new Error('User does not have the order');
    }

    // check if operation validity - throws error if invalid
    this.checkTransactionOperationDataValidity(userData, order);

    // check if market is open
    const marketType = order.sector === 'CRYPTO' ? 'crypto' : 'stock';
    const isMarketOpen = this.marketApiService.isMarketOpenForQuote(marketType);

    // if market is closed, create outstanding order
    if (!isMarketOpen) {
      this.outstandingOrdersApiService.addOutstandingOrder(order);
      return {
        type: 'order',
        data: order,
      };
    }

    // create transaction
    const transaction = createTransaction(userData, order, order.potentialSymbolPrice);

    // update user's transactions
    this.userApiService.addUserPortfolioTransactions(userData.id, transaction);

    // return transaction
    return {
      type: 'transaction',
      data: transaction,
    };
  }

  /**
   * possible to delete an order if it's open and the user who created the order is the same as the user in the order
   * @param order
   * @param userData
   */
  deleteOrder(order: OutstandingOrder, userData: UserBaseMin): void {
    // check if the user who creates the order is the same as the user in the order
    if (order.userData.id !== userData.id) {
      throw new Error('User does not have the order');
    }

    // delete the order
    this.outstandingOrdersApiService.deleteOutstandingOrder(order, userData);
  }

  /**
   * validates transaction order, whether the user has enough cash on hand
   * check to make:
   * - user exists
   * - user has enough cash on hand if BUY and cashAccountActive
   * - user has enough units on hand if SELL
   * - units: positive,
   * - date: valid, not weekend, not future, not too old
   * - symbol: exists
   *
   * @param order - transaction order user wants to create
   * @param currentPrice - current price of the symbol
   * @param userData - user who wants to create the transaction
   */
  private checkTransactionOperationDataValidity(userData: UserData, order: OutstandingOrder): void {
    // negative units
    if (order.units <= 0) {
      throw new Error(TRANSACTION_INPUT_UNITS_POSITIVE);
    }

    // check if units is integer
    if (order.symbolType !== 'CRYPTO' && !Number.isInteger(order.units)) {
      throw new Error(TRANSACTION_INPUT_UNITS_INTEGER);
    }

    // get year data form input and today
    const { year: inputYear } = dateGetDetailsInformationFromDate(order.createdAt);
    const { year: todayYear } = dateGetDetailsInformationFromDate(new Date());

    // prevent loading more than N year of asset data - just in case
    if (todayYear - inputYear > HISTORICAL_PRICE_RESTRICTION_YEARS) {
      throw new Error(DATE_TOO_OLD);
    }

    // calculate total value
    const totalValue = order.potentialTotalPrice;

    // BUY order
    if (order.orderType.type === 'BUY') {
      // check if user has enough cash on hand if BUY and cashAccountActive
      if (userData.portfolioState.cashOnHand < totalValue) {
        throw new Error(USER_NOT_ENOUGH_CASH_ERROR);
      }

      // check if user can buy this symbol - will not go over limit
      const hasInHolding = userData.holdingSnapshot.data.find((d) => d.symbol === order.symbol);
      if (!hasInHolding && userData.holdingSnapshot.data.length >= USER_HOLDINGS_SYMBOL_LIMIT) {
        throw new Error(USER_HOLDING_LIMIT_ERROR);
      }
    }
    // SELL order
    else if (order.orderType.type === 'SELL') {
      // check if user has any holdings of that symbol
      const symbolHoldings = userData.holdingSnapshot.data.find((d) => d.symbol === order.symbol);

      // check if user has enough units on hand if SELL
      if ((symbolHoldings?.units ?? -1) < order.units) {
        throw new Error(USER_NOT_UNITS_ON_HAND_ERROR);
      }
    }
    // unsupported order type
    else {
      throw new Error('Order type not supported');
    }
  }
}
