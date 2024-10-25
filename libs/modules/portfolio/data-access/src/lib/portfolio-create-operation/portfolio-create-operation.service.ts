import { Injectable, inject } from '@angular/core';
import { MarketApiService, OutstandingOrderApiService, UserApiService } from '@mm/api-client';
import { OutstandingOrder, PortfolioTransaction, UserAccountEnum, UserData } from '@mm/api-types';
import { checkTransactionOperationDataValidity, createTransaction } from '@mm/shared/general-util';

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
  async createOrder(
    userData: UserData,
    order: OutstandingOrder,
  ): Promise<
    | {
        type: 'order';
        data: OutstandingOrder;
      }
    | {
        type: 'transaction';
        data: PortfolioTransaction;
      }
  > {
    // check if the user who creates the order is the same as the user in the order
    if (order.userData.id !== userData.id) {
      throw new Error('User does not have the order');
    }

    // only allow demo trading users to create orders
    if (userData.userAccountType !== UserAccountEnum.DEMO_TRADING) {
      throw new Error('User does not have the order');
    }

    // check if operation validity - throws error if invalid
    checkTransactionOperationDataValidity(userData, order, order.potentialSymbolPrice);

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
}
