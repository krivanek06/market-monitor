import { PortfolioGrowth, PortfolioState, PortfolioStateHoldingBase, PortfolioTransaction } from './portfolio.model';
import { UserBaseMin } from './user.model';

export type TradingSimulator = {
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
   * date when this simulation was last updated
   */
  updatedDate: string;

  /**
   * date when this simulation will start - format: 'YYYY-MM-DDTHH:mm:ss' (new Date().toISOString())
   */
  startDateTime: string;

  /**
   * date when this simulation will end - format: 'YYYY-MM-DDTHH:mm:ss' (new Date().toISOString())
   */
  endDateTime: string;

  /**
   * total time in seconds how long the trading simulator will be active
   */
  totalTimeSeconds: number;

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
   * draft - user is setting up the trading simulator, not yet visible for public
   * live - trading simulator is live, visible for public, and users can join
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
   * cash value user starts with
   */
  cashStartingValue: number;

  /**
   * how many symbols are available in the trading simulator -> symbols.length()
   */
  symbolAvailable: number;

  /**
   * default is false, when the trading simulator is finished, then CF should calculate the statistics
   * and set this value to true
   */
  statisticsGenerated: boolean;

  /**
   * person who created the trading simulator
   */
  owner: UserBaseMin;

  /**
   * original symbols that are used in the trading simulator
   */
  symbols: string[];

  /**
   * userIds who are participating in the trading simulator
   */
  participants: string[];

  /**
   * possible to add more cash to the participating users
   */
  cashAdditionalIssued: {
    /**
     * when the cash is added to users
     * range: 1 - maximumRounds
     */
    issuedOnRound: number;
    value: number;
  }[];

  /**
   * modify the return of symbols historical data
   * imitate market crashes, bubbles, etc.
   */
  marketChange: {
    /** on which round to influence prices */
    startingRound: number;
    /** on which round to stop influencing prices */
    endingRound: number;
    /** how much in % to influence market */
    valueChange: number;
  }[];

  /**
   * possible to enable margin trading for users
   */
  marginTrading: {
    /** number of rounds (periods) how often a $$ amount should be subtracted from an user */
    subtractPeriodRounds: number;
    /** amount (in %) of the borrowing value to subtract from the user */
    subtractInterestRate: number;
    /** rate which user can take out margin, example: 3 -> 3:1 */
    marginConversionRate: number;
  } | null;
};

/**
 * data about each participant in the trading simulator
 */
export type TradingSimulatorParticipant = {
  userData: UserBaseMin;

  /**
   * current state of the user's portfolio
   */
  portfolioState: PortfolioState;

  /**
   * current user symbol holdings
   */
  holdings: PortfolioStateHoldingBase[];

  /**
   * user's portfolio growth data - updated when simulator closes
   */
  portfolioGrowth: PortfolioGrowth[];

  /**
   * user's last N executed portfolio transactions
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
   * how many units of this symbol is available in the market start (defined by the admin)
   * If -1, then it's unlimited
   * - possible to later issue more shares
   */
  unitsAvailableOnStart: number;

  /**
   * if true, then the symbol has unlimited units
   */
  unitsInfinity: boolean;

  /**
   * by how much to multiply the original price
   */
  priceMultiplication: number;

  /**
   * possible to issue more shares of a specific symbol
   */
  unitsAdditionalIssued: {
    /**
     * when the units are issued
     * range: 1 - maximumRounds
     */
    issuedOnRound: number;
    units: number;
  }[];

  /**
   * original historical data of a symbol
   */
  historicalDataOriginal: number[];

  /**
   * modified historical data of a symbol (calculated when setting up the trading simulator)
   */
  historicalDataModified: number[];
};

/**
 * some aggregations of the trading simulator
 */
export type TradingSimulatorLatestData = {
  live: TradingSimulator[];
  started: TradingSimulator[];
  historical: TradingSimulator[];
};

/** statistics about available symbols */
export type TradingSimulatorAggregationSymbols = {
  [K in string]: {
    buyOperations: number;
    boughtUnits: number;
    investedTotal: number;

    sellOperations: number;
    soldUnits: number;
    soldTotal: number;

    /**
     * every time a transaction happens, this value is updated
     * default is the same as 'unitsAvailableOnStart'
     * should never be negative
     */
    unitsCurrentlyAvailable: number;
    unitsInfinity: boolean;
  };
};

/**
 * aggregation data about the trading simulator
 * calculated once simulator is finished
 */
export type TradingSimulatorAggregations = {
  /** copied data from TradingSimulatorAggregationSymbols */
  symbolStatistics: TradingSimulatorAggregationSymbols;

  /** best return transaction (only SELL transactions) */
  bestTransactions: PortfolioTransaction[];

  /** worst return transaction (only SELL transactions) */
  worstTransactions: PortfolioTransaction[];

  /** last N transactions of whatever user */
  lastTransactions: PortfolioTransaction[];
};

/**
 *
 * collection: trading_simulator
 * - document: TradingSimulator
 *   -- collection: more_information
 *     -- document: aggregations: TradingSimulatorAggregations
 *     -- document: aggregation_symbols: TradingSimulatorAggregationSymbols
 *
 *   -- collection: participants (each user one document)
 *    -- documents: TradingSimulatorParticipant
 *
 *   -- collection: symbols (each symbol one document)
 *    -- documents: TradingSimulatorSymbol
 *
 *   -- collection: transactions
 *    -- documents: PortfolioTransaction
 */
