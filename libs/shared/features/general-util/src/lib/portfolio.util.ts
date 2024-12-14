import {
  OutstandingOrder,
  PortfolioGrowth,
  PortfolioGrowthAssets,
  PortfolioGrowthAssetsDataItem,
  PortfolioState,
  PortfolioStateHolding,
  PortfolioStateHoldingBase,
  PortfolioStateHoldings,
  PortfolioTransaction,
  SymbolQuote,
  USER_DEFAULT_STARTING_CASH,
} from '@mm/api-types';
import { isSameDay } from 'date-fns';
import {
  fillOutMissingDatesForDate,
  getCurrentDateDefaultFormat,
  getCurrentDateDetailsFormat,
  getYesterdaysDate,
} from './date-service.util';
import { calculateGrowth, roundNDigits } from './general-function.util';

export const createEmptyPortfolioState = (startingCash = 0): PortfolioState => ({
  balance: startingCash,
  cashOnHand: startingCash,
  holdingsBalance: 0,
  invested: 0,
  numberOfExecutedBuyTransactions: 0,
  numberOfExecutedSellTransactions: 0,
  startingCash: startingCash,
  transactionFees: 0,
  date: getCurrentDateDefaultFormat(),
  totalGainsPercentage: 0,
  totalGainsValue: 0,
  firstTransactionDate: null,
  lastTransactionDate: null,
  previousBalanceChange: 0,
  previousBalanceChangePercentage: 0,
  transactionProfit: 0,
});

/**
 * for provided transactions, calculate portfolio growth assets
 *
 * @param transactions - user's transactions (may be filtered out only for selected symbol)
 * @param historicalPrices - historical prices for symbols
 * @returns - portfolio growth assets
 */
export const getPortfolioGrowthAssets = (
  transactions: PortfolioTransaction[],
  historicalPrices: { [key: string]: { close: number; date: string }[] },
): PortfolioGrowthAssets[] => {
  const symbols = Object.keys(historicalPrices);

  // format historical prices into dates as keys
  const newFormat = Object.keys(historicalPrices).map((d) => ({
    symbol: d,
    data: historicalPrices[d].reduce(
      (acc, curr) => ({
        ...acc,
        [curr.date]: curr.close,
      }),
      {} as { [key: string]: number },
    ),
  }));

  // create portfolio growth assets
  const result: PortfolioGrowthAssets[] = symbols
    .map((symbol) => {
      // historical data per symbol
      const symbolHistoricalPrice = historicalPrices[symbol];

      // check if historical prices are missing (symbol bought today)
      if (!symbolHistoricalPrice || symbolHistoricalPrice.length === 0) {
        console.log(`Missing historical prices for ${symbol}`);
        return null;
      }

      // get all transactions for this symbol in ASC order by date
      const symbolTransactions = transactions.filter((d) => d.symbol === symbol);

      // generates all dates from first transaction date until yesterday
      const transactionDate = fillOutMissingDatesForDate(symbolTransactions[0].date, getYesterdaysDate(), false);

      // get historical price for the selected symbol
      const pricePerDate = newFormat.find((d) => d.symbol === symbol)?.data ?? {};

      // internal helper
      const aggregator = {
        units: 0,
        index: 0,
        breakEvenPrice: 0,
        accumulatedReturn: 0,
      };

      const growthAssetItems = transactionDate.reduce((acc, date) => {
        // modify the aggregator for every transaction that happened on that date
        // can be multiple transactions on the same day for the same symbol
        while (!!symbolTransactions[aggregator.index] && isSameDay(symbolTransactions[aggregator.index].date, date)) {
          const transaction = symbolTransactions[aggregator.index];
          const isBuy = transaction.transactionType === 'BUY';

          // change break even price
          aggregator.breakEvenPrice = isBuy
            ? (aggregator.units * aggregator.breakEvenPrice + transaction.units * transaction.unitPrice) /
              (aggregator.units + transaction.units)
            : aggregator.breakEvenPrice;

          // add or subtract units depending on transaction type
          aggregator.units += isBuy ? transaction.units : -transaction.units;
          aggregator.units = transaction.symbolType === 'CRYPTO' ? roundNDigits(aggregator.units, 4) : aggregator.units;

          // increment next transaction index
          aggregator.index += 1;

          // calculate accumulated return
          aggregator.accumulatedReturn += roundNDigits(transaction.returnValue - transaction.transactionFees);
        }

        // get prince for the date - stocks on weekend do not have any data
        const historicalPrice = pricePerDate[date];

        // skip weekends - no historical data
        if (!historicalPrice) {
          return acc;
        }

        const breakEvenValue = roundNDigits(aggregator.units * aggregator.breakEvenPrice);
        const marketTotalValue = roundNDigits(aggregator.units * historicalPrice);

        const portfolioAsset = {
          investedTotal: breakEvenValue,
          date: date,
          units: aggregator.units,
          marketTotal: marketTotalValue,
          profit: roundNDigits(marketTotalValue - breakEvenValue + aggregator.accumulatedReturn),
          accumulatedReturn: roundNDigits(aggregator.accumulatedReturn),
        } satisfies PortfolioGrowthAssetsDataItem;

        return [...acc, portfolioAsset];
      }, [] as PortfolioGrowthAssetsDataItem[]);

      const displaySymbol = symbolTransactions.at(0)?.displaySymbol ?? symbol;
      return {
        symbol,
        displaySymbol,
        // remove data with 0 market value, however always keep last one (it has a different profit since it was SOLD)
        data: growthAssetItems.filter((d, i) => !(d.marketTotal === 0 && growthAssetItems[i - 1]?.marketTotal === 0)),
      } satisfies PortfolioGrowthAssets;
    })
    // remove undefined or symbols which were bought and sold on the same day
    .filter((d): d is PortfolioGrowthAssets => !!d && d.data.length > 0);

  return result;
};

/**
 * get user's current holdings from all previous transactions and open orders
 * - remove units from holdings if there are open SELL orders
 *
 * @param transactions - user's transactions
 * @returns
 */
export const getPortfolioStateHoldingBaseByTransactionsUtil = (
  transactions: PortfolioTransaction[],
  openOrders: OutstandingOrder[] = [],
): PortfolioStateHoldingBase[] => {
  const holdingsBase = transactions
    .reduce((acc, curr) => {
      const existingHolding = acc.find((d) => d.symbol === curr.symbol);
      const isSell = curr.transactionType === 'SELL';
      const isCrypto = curr.sector === 'CRYPTO';

      // update existing holding
      if (existingHolding) {
        const newUnits = existingHolding.units + (isSell ? -curr.units : curr.units);
        existingHolding.units = isCrypto ? roundNDigits(newUnits, 4) : roundNDigits(newUnits);
        existingHolding.invested += roundNDigits(curr.unitPrice * curr.units * (isSell ? -1 : 1));

        if (!isSell) {
          existingHolding.breakEvenPrice = roundNDigits(existingHolding.invested / existingHolding.units);
        }

        return acc;
      }

      // first value can not be sell
      if (isSell) {
        console.error('First transaction can not be sell');
      }

      // add new holding
      return [
        ...acc,
        {
          symbolType: curr.symbolType,
          symbol: curr.symbol,
          sector: curr.sector,
          units: curr.units,
          invested: roundNDigits(curr.unitPrice * curr.units),
          breakEvenPrice: roundNDigits(curr.unitPrice),
        } satisfies PortfolioStateHoldingBase,
      ];
    }, [] as PortfolioStateHoldingBase[])
    .filter((d) => d.units > 0);

  // check open SELL orders and remove units from holdings
  const holdingsBaseWithOpenOrders = holdingsBase.map((d) => {
    // user can have multiple open orders for the same symbol
    const symbolSellOrderUnits = openOrders
      .filter((o) => o.symbol === d.symbol && o.orderType.type === 'SELL')
      .reduce((acc, curr) => acc + curr.units, 0);

    const newUnits = d.units - symbolSellOrderUnits;
    return {
      ...d,
      units: d.sector === 'CRYPTO' ? roundNDigits(newUnits, 4) : Math.floor(newUnits),
    } satisfies PortfolioStateHoldingBase;
  });

  return holdingsBaseWithOpenOrders;
};

/**
 *
 * @param currentPortfolio - current portfolio state
 * @param newTransaction - newly created transaction
 * @param previousTransactions - all previous transactions
 * @returns - updated portfolio by new transaction
 */
export const recalculatePortfolioStateByTransactions = (
  currentPortfolio: PortfolioState,
  newTransaction: PortfolioTransaction,
  previousTransactions: PortfolioTransaction[],
  orders: OutstandingOrder[] = [],
): PortfolioState => {
  const isSell = newTransaction.transactionType === 'SELL';
  const totalPrice = roundNDigits(newTransaction.unitPrice * newTransaction.units);

  // calculate if transaction was profit or loss and add into the balanace
  const newInvestedDiff = currentPortfolio.invested + (isSell ? -totalPrice : totalPrice);

  // calculate total invested value based on all transactions
  const newInvested = getPortfolioStateHoldingBaseByTransactionsUtil([...previousTransactions, newTransaction]).reduce(
    (acc, curr) => acc + curr.invested,
    0,
  );

  const newHoldingsBalance = currentPortfolio.holdingsBalance + (isSell ? -totalPrice : totalPrice);
  const newNumberOfExecutedBuyTransactions = currentPortfolio.numberOfExecutedBuyTransactions + (isSell ? 0 : 1);
  const newNumberOfExecutedSellTransactions = currentPortfolio.numberOfExecutedSellTransactions + (isSell ? 1 : 0);
  const newTransactionFees = currentPortfolio.transactionFees + newTransaction.transactionFees;
  const newTransactionProfit = currentPortfolio.transactionProfit + newTransaction.returnValue;

  // remove cash spent on open orders
  const spentCashOnOpenOrders = orders
    .filter((d) => d.orderType.type === 'BUY')
    .reduce((acc, curr) => acc + curr.potentialTotalPrice, 0);

  const newCashOnHand =
    currentPortfolio.startingCash -
    newInvestedDiff +
    currentPortfolio.transactionProfit -
    newTransactionFees -
    spentCashOnOpenOrders;

  // add spent cash on open orders into balance to avoid negative balance
  const newBalance = newHoldingsBalance + newCashOnHand + spentCashOnOpenOrders;

  // update portfolio
  const updatedPortfolio = {
    ...currentPortfolio,
    balance: roundNDigits(newBalance),
    cashOnHand: roundNDigits(newCashOnHand),
    invested: roundNDigits(newInvested),
    holdingsBalance: roundNDigits(newHoldingsBalance),
    numberOfExecutedBuyTransactions: newNumberOfExecutedBuyTransactions,
    numberOfExecutedSellTransactions: newNumberOfExecutedSellTransactions,
    totalGainsValue: roundNDigits(newBalance - currentPortfolio.startingCash),
    totalGainsPercentage: calculateGrowth(newBalance, currentPortfolio.startingCash),
    transactionFees: roundNDigits(newTransactionFees),
    transactionProfit: roundNDigits(newTransactionProfit),
  } satisfies PortfolioState;

  // return results
  return updatedPortfolio;
};

/**
 *
 * @param portfolioAssets - asset data for every symbol user owned
 * @param startingCashValue - starting cash value
 * @param ignoreDates - dates to ignore (holidays)
 * @returns
 */
export const getPortfolioGrowth = (
  portfolioAssets: PortfolioGrowthAssets[],
  startingCashValue = 0,
  ignoreDates: string[] = [],
): PortfolioGrowth[] => {
  // user has no transactions yet
  if (!portfolioAssets || portfolioAssets.length === 0) {
    return [];
  }

  // get soonest date
  const soonestDate = portfolioAssets.reduce(
    (acc, curr) => (curr.data[0].date < acc ? curr.data[0].date : acc),
    getYesterdaysDate(),
  );

  // generate dates from soonest until today
  const generatedDates = fillOutMissingDatesForDate(soonestDate, getYesterdaysDate());

  // result of portfolio growth
  const result: PortfolioGrowth[] = [];

  // accumulate return values, because it is increasing per symbol - {symbol: accumulatedReturn}
  const accumulatedReturn = new Map<string, number>();

  // loop though all generated dates
  for (const gDate of generatedDates) {
    // check if holiday
    if (ignoreDates.includes(gDate)) {
      continue;
    }

    // initial object
    const portfolioItem: PortfolioGrowth = {
      date: gDate,
      investedTotal: 0,
      marketTotal: 0,
      balanceTotal: startingCashValue,
    };

    // loop though all portfolio assets per date
    for (const portfolioAsset of portfolioAssets) {
      // find current portfolio asset on this date
      const currentPortfolioAsset = portfolioAsset.data.find((d) => d.date === gDate);

      // not found
      if (!currentPortfolioAsset) {
        continue;
      }

      // save accumulated return
      accumulatedReturn.set(portfolioAsset.symbol, currentPortfolioAsset.accumulatedReturn);

      // add values to initial object
      portfolioItem.marketTotal += currentPortfolioAsset.marketTotal;
      portfolioItem.investedTotal += currentPortfolioAsset.investedTotal;
      portfolioItem.balanceTotal += currentPortfolioAsset.marketTotal - currentPortfolioAsset.investedTotal;
    }

    // add accumulated return to total balance
    portfolioItem.balanceTotal += Array.from(accumulatedReturn.entries()).reduce((acc, curr) => acc + curr[1], 0);

    // round values
    portfolioItem.balanceTotal = roundNDigits(portfolioItem.balanceTotal);
    portfolioItem.marketTotal = roundNDigits(portfolioItem.marketTotal);
    portfolioItem.investedTotal = roundNDigits(portfolioItem.investedTotal);

    // save result
    result.push(portfolioItem);
  }

  return result;
};

/**
 * calculates user's portfolio based on provided data. Used in Cloud Functions and on FE
 *
 * @param accountType - user's account type
 * @param transactions - user's transactions
 * @param partialHoldings - user's data for current holdings
 * @param symbolSummaries - loaded summaries for user's holdings
 * @returns
 */
export const getPortfolioStateHoldingsUtil = (
  transactions: PortfolioTransaction[],
  symbolQuotes: SymbolQuote[],
  openOrders: OutstandingOrder[] = [],
  startingCash = USER_DEFAULT_STARTING_CASH,
): PortfolioStateHoldings => {
  const numberOfExecutedBuyTransactions = transactions.filter((t) => t.transactionType === 'BUY').length;
  const numberOfExecutedSellTransactions = transactions.filter((t) => t.transactionType === 'SELL').length;
  const transactionFees = transactions.reduce((acc, curr) => acc + curr.transactionFees, 0);
  const partialHoldings = getPortfolioStateHoldingBaseByTransactionsUtil(transactions);

  // value that user invested in all assets
  const investedTotal = partialHoldings.reduce((acc, curr) => acc + curr.invested, 0);

  // user's holdings with summary data
  const portfolioStateHolding = symbolQuotes
    .map((quote) => {
      const holding = partialHoldings.find((d) => d.symbol === quote.symbol);

      // user can have multiple open orders for the same symbol
      const symbolSellOrderUnits = openOrders
        .filter((d) => d.symbol === quote.symbol && d.orderType.type === 'SELL')
        .reduce((acc, curr) => acc + curr.units, 0);

      if (!holding) {
        console.log(`Holding not found for symbol ${quote.symbol}`);
        return null;
      }

      return {
        ...holding,
        units: roundNDigits(holding.units - symbolSellOrderUnits, 4),
        invested: roundNDigits(holding.invested),
        breakEvenPrice: roundNDigits(holding.invested / holding.units, 4),
        weight: roundNDigits(holding.invested / investedTotal, 6),
        symbolQuote: quote,
      } satisfies PortfolioStateHolding;
    })
    .filter((d) => !!d) as PortfolioStateHolding[];

  // sort holdings by balance
  const portfolioStateHoldingSortedByBalance = [...portfolioStateHolding].sort(
    (a, b) => b.symbolQuote.price * b.units - a.symbolQuote.price * a.units,
  );

  // value of all assets
  const holdingsBalance = portfolioStateHolding.reduce((acc, curr) => acc + curr.symbolQuote.price * curr.units, 0);

  // calculate profit/loss from created transactions
  const transactionsProfit = transactions.reduce(
    // prevent NaN, undefined and Infinity
    (acc, curr) => acc + (isFinite(curr.returnValue) ? curr.returnValue : 0),
    0,
  );

  // remove cash spent on open orders
  const spentCashOnOpenOrders = openOrders
    .filter((d) => d.orderType.type === 'BUY')
    .reduce((acc, curr) => acc + curr.potentialTotalPrice, 0);

  // current cash on hand
  const cashOnHandTransactions =
    startingCash - investedTotal + transactionsProfit - spentCashOnOpenOrders - transactionFees;

  const balance = holdingsBalance + cashOnHandTransactions + spentCashOnOpenOrders;
  const totalGainsValue = balance - startingCash;
  const totalGainsPercentage = calculateGrowth(balance, startingCash);
  const firstTransactionDate = transactions.length > 0 ? transactions[0].date : null;
  const lastTransactionDate = transactions.length > 0 ? transactions[transactions.length - 1].date : null;

  // calculate daily portfolio change
  const balanceChange = portfolioStateHolding.reduce((acc, curr) => acc + curr.symbolQuote.change * curr.units, 0);
  const balanceChangePrct = holdingsBalance === 0 ? 0 : calculateGrowth(balance, balance - balanceChange);

  const result: PortfolioStateHoldings = {
    numberOfExecutedBuyTransactions,
    numberOfExecutedSellTransactions,
    transactionFees: roundNDigits(transactionFees),
    transactionProfit: roundNDigits(transactionsProfit),
    cashOnHand: roundNDigits(cashOnHandTransactions),
    balance: roundNDigits(balance),
    invested: roundNDigits(investedTotal),
    holdingsBalance: roundNDigits(holdingsBalance),
    totalGainsValue: roundNDigits(totalGainsValue),
    totalGainsPercentage: roundNDigits(totalGainsPercentage, 4),
    startingCash: roundNDigits(startingCash),
    firstTransactionDate,
    lastTransactionDate,
    date: getCurrentDateDetailsFormat(),
    // calculate data for previous portfolio
    previousBalanceChange: balanceChange,
    previousBalanceChangePercentage: balanceChangePrct,
    holdings: portfolioStateHoldingSortedByBalance,
  };

  return result;
};
