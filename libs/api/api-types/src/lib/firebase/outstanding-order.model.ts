import { SymbolStoreBase } from './portfolio.model';
import { UserBaseMin } from './user.model';

/**
 * data about open orders from users
 */
export type OutstandingOrder = SymbolStoreBase & {
  orderId: string;

  /** data of the user who created the order */
  userData: UserBaseMin;

  /** modified symbol ID */
  displaySymbol: string;

  /** units to transact */
  units: number;

  /**
   * when the order was created
   * format: 'yyyy-MM-dd HH:mm:ss' (new Date().toISOString())
   */
  createdAt: string;

  /**
   * when the order was closed (fulfilled by the system)
   * format: 'yyyy-MM-dd HH:mm:ss' (new Date().toISOString())
   */
  closedAt: string | null;

  /**
   * price of the symbol when the user created the order
   * used to subtract the user's cash when the order is created
   */
  potentialSymbolPrice: number;
  potentialTotalPrice: number;

  /** type of order */
  orderType:
    | {
        /** normal market BUY order */
        type: 'BUY';

        /**
         * (Optional) - don't buy immediately, but wait until the price of the symbol goes ABOVE this value
         */
        buyOrder?: number;

        /**
         * (Optional) - maximum price to buy the shares. If price goes above this value, the order is canceled
         * only used when 'buyOrder' is defined
         */
        buyLimitOrder?: number;
      }
    | {
        /** normal market SELL order */
        type: 'SELL';

        /**
         * (Optional) - don't sell immediately, but wait until the price of the symbol goes BELOW this value
         */
        stopOrder?: number;

        /**
         * (Optional) - minimum price to sell the shares. If price goes below this value, the order is canceled
         * only used when 'stopOrder' is defined
         */
        stopLimitOrder?: number;
      }
    | {
        // idea: borrow -> sell -> buy -> return
        type: 'SHORT';

        /**
         * price of the symbol when the user shorted it
         */
        shortedPrice: number;

        /**
         * (Optional) - trigger market SHORT order if the price of the symbol goes BELOW this value
         */
        shortOrder?: number;

        /**
         * interest that the user must pay for shorting the symbol
         * example: 5.53 is 5.53%
         */
        interestRatePrct: number;

        /**
         * how often (in days) the interest is subtracted from the user
         */
        interestRatePeriodDays: number;

        /**
         * percentage value of the margin rate, if the user is is LOSS and the margin rate is reached, the user's position is closed
         * example: 50 is 50%
         * default: 50
         */
        marginRatePrct: number;
      };
};
