import { DataDocsWrapper } from '../constants';
import { PortfolioGrowth, PortfolioStateHoldingBase, PortfolioTransaction, SymbolStoreBase } from './portfolio.model';
import { UserBase, UserBaseMin } from './user.model';

export type TradingSimulatorBase = {
  id: string;

  /**
   * name of the trading simulator
   */
  name: string;

  /**
   * date when this simulation was created
   */
  createdDate: string;

  /**
   * date when this simulation will start - format: 'YYYY-MM-DDTHH:mm:ss' (new Date().toISOString())
   */
  startDateTime: string;

  /**
   * code that is needed to join the trading simulator
   * if empty, then anybody can join it
   */
  invitationCode: string;

  /**
   * how many users participate in the trading simulator
   */
  currentParticipants: number;

  /**
   * state of the trading simulator
   *
   * draft - admin is setting up the trading simulator, not yet visible for public
   * live - trading simulator is live and users can play it
   * started - trading simulator is started and users can't join it anymore
   * finished - trading simulator is finished and users can't play it anymore
   */
  state: 'draft' | 'live' | 'started' | 'finished';

  /**
   * how many seconds one round lasts
   */
  oneRoundDurationSeconds: number;

  /**
   * how many rounds are in the trading simulator until it ends
   */
  maximumRounds: number;

  /**
   * current round of the trading simulator
   * calculated from the startDateTime + oneRoundDurationSeconds
   */
  currentRound: number;

  /**
   * cash value user starts with
   */
  startingCashValue: number;

  /**
   * how many symbols are available in the trading simulator -> symbols.length()
   */
  availableSymbols: number;
};

/**
 * data about the trading simulator
 */
export type TradingSimulator = TradingSimulatorBase & {
  /**
   * original symbols that are used in the trading simulator
   */
  symbols: string[];

  /**
   * additional data about selected symbols
   */
  symbolsData: {
    // key is the original symbol saved in symbols array
    [key: string]: {
      /**
       * changing the name of original symbol to prevent cheating from user's side
       * default: {AAPL: 'Symbol1', GOOGL: 'Symbol2', ...}
       */
      displayName: string;

      /**
       * how many units of this symbol is available in the market start (defined by the admin)
       * If -1, then it's unlimited
       * - possible to later issue more shares
       */
      unitsAvailableOnStart: number;
    };
  };

  /**
   * admin can setup modifications to the historical data of a symbol
   */
  modifications: (
    | {
        /** possible to modify the return of symbol historical data */
        type: 'returnChange';
        symbol: string;
        from: string; // format 'YYYY-MM-DD'
        to: string; // format 'YYYY-MM-DD'

        /**
         * how much the price of the symbol changes in percentage between 'from' and 'to' dates
         */
        returnChange: number; // example: 11.5 is 11.5%
      }
    | {
        /** possible to issue more shares of a specific symbol */
        type: 'sharesIssued';
        symbol: string;
        date: string; // format 'YYYY-MM-DD'
        /** additional share units to issue to the market */
        units: number;
      }
    | {
        /** possible to add more cash to the participating users */
        type: 'cashIssued';
        date: string; // format 'YYYY-MM-DD'
        value: number;
      }
  )[];

  /**
   * possible to enable margin trading for users
   */
  marginTrading?: {
    /** number of days (periods) how often a $$ amount should be subtracted from an user */
    subtractPeriodDays: number;
    /** amount to subtract from the user */
    subtractAmount: number;
    /** rate which user can take out margin, example: 3 -> 3:1 */
    marginConversionRate: number;
  };
};

/**
 * data about each participant in the trading simulator
 */
export type TradingSimulatorParticipant = {
  userData: UserBaseMin;

  /**
   * current user symbol holdings
   * todo - maybe this is not important and can be calculated each time on the UI
   */
  holdings: PortfolioStateHoldingBase[];

  /**
   * user's portfolio growth data - updated on every next round
   */
  portfolioGrowth: PortfolioGrowth[];

  /**
   * user's executed portfolio transactions
   */
  transactions: PortfolioTransaction[];
};

/**
 * data about one select symbol in the trading simulator
 */
export type TradingSimulatorSymbol = {
  /**
   * which symbol this historical data belongs to
   */
  symbol: string;

  /**
   * historical data of a symbol
   */
  historicalDataOriginal: {
    date: string;
    price: number;
  }[];

  /**
   * modified historical data of a symbol (calculated when setting up the trading simulator)
   */
  historicalDataModified: {
    date: string;
    price: number;
  };
};

/**
 * data about open orders from users
 */
export type TradingSimulatorOrder = SymbolStoreBase & {
  /** document ID */
  orderId: string;

  /** data of the user who created the order */
  userData: UserBaseMin;

  /** modified symbol ID */
  displaySymbol?: string;

  /** units to transact */
  units: number;

  /**
   * status of the order
   * open - order is active and waiting for the price to reach the desired value
   * closed - order was fulfilled by the system
   */
  status: 'open' | 'closed';

  /**
   * when the order was created
   * format: 'YYYY-MM-DDTHH:mm:ss' (new Date().toISOString())
   */
  createdAt: string;

  /**
   * when the order was closed (fulfilled by the system)
   * format: 'YYYY-MM-DDTHH:mm:ss' (new Date().toISOString())
   */
  closedAt: string;

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

/**
 * transaction container
 */
export type TradingSimulatorTransactions = {
  /** best return transaction (only SELL transactions) */
  bestTransaction: PortfolioTransaction[];

  /** worst return transaction (only SELL transactions) */
  worstTransaction: PortfolioTransaction[];

  /** last N transactions of whatever user */
  lastTransactions: PortfolioTransaction[];
};

/**
 * some aggregations of the trading simulator
 */
export type TradingSimulatorLatestData = {
  live: TradingSimulatorBase[];
  open: TradingSimulatorBase[];
  historical: TradingSimulatorBase[];
};

/**
 * user ranking in the trading simulator, updates on each next round
 */
export type TradingSimulatorUserRanking = DataDocsWrapper<UserBase>;

/**
 * users who will be participating in the trading simulator
 */
export type TradingSimulatorParticipatingUsers = DataDocsWrapper<UserBaseMin>;

/**
 * aggregations of the trading simulator example:
 * - which symbol was how many times bought/sold
 * - which user had the best return
 */
// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type TradingSimulatorAggregations = {};

/**
 *
 * collection: trading_simulator
 * - document: TradingSimulator - also save TradingSimulatorLatestData, to prevent reading all documents
 *   -- collection: more_information
 *     -- document: TradingSimulatorTransactions
 *     -- document: TradingSimulatorUserRanking
 *     -- document: TradingSimulatorParticipatingUsers
 *
 *   -- collection: orders
 *     -- document: TradingSimulatorOrder
 *
 *   -- collection: participants (each user one document)
 *    -- documents: TradingSimulatorParticipant
 *
 *   -- collection: symbols (each symbol one document)
 *    -- documents: TradingSimulatorSymbol
 */

// todo - if shorting is possible and I want to close my position, what to do if units are not available ??
