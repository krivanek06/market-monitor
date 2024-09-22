import {
  HistoricalPrice,
  PortfolioGrowth,
  PortfolioGrowthAssets,
  PortfolioGrowthAssetsDataItem,
  PortfolioState,
  PortfolioStateHolding,
  PortfolioStateHoldingBase,
  PortfolioStateHoldings,
  PortfolioTransaction,
  SymbolQuote,
} from '@mm/api-types';
import { isBefore, isSameDay } from 'date-fns';
import {
  fillOutMissingDatesForDate,
  getCurrentDateDefaultFormat,
  getCurrentDateDetailsFormat,
  getYesterdaysDate,
} from './date-service.util';
import { calculateGrowth, roundNDigits } from './general-function.util';

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
  partialHoldings: PortfolioStateHoldingBase[],
  symbolQuotes: SymbolQuote[],
  startingCash = 0,
): PortfolioStateHoldings => {
  const numberOfExecutedBuyTransactions = transactions.filter((t) => t.transactionType === 'BUY').length;
  const numberOfExecutedSellTransactions = transactions.filter((t) => t.transactionType === 'SELL').length;
  const transactionFees = transactions.reduce((acc, curr) => acc + curr.transactionFees, 0);

  // value that user invested in all assets
  const investedTotal = partialHoldings.reduce((acc, curr) => acc + curr.invested, 0);

  // user's holdings with summary data
  const portfolioStateHolding = symbolQuotes
    .map((quote) => {
      const holding = partialHoldings.find((d) => d.symbol === quote.symbol);
      if (!holding) {
        console.log(`Holding not found for symbol ${quote.symbol}`);
        return null;
      }
      return {
        ...holding,
        invested: roundNDigits(holding.invested),
        breakEvenPrice: roundNDigits(holding.invested / holding.units),
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
  const transactionProfitLoss = transactions.reduce((acc, curr) => acc + (curr?.returnValue ?? 0), 0);

  // current cash on hand
  const cashOnHandTransactions =
    (startingCash !== 0 ? startingCash - investedTotal - transactionFees : 0) + transactionProfitLoss;

  const balance = holdingsBalance + cashOnHandTransactions;
  const totalGainsValue = startingCash !== 0 ? balance - startingCash : holdingsBalance - investedTotal;
  const totalGainsPercentage =
    startingCash !== 0 ? calculateGrowth(balance, startingCash) : calculateGrowth(balance, investedTotal);
  const firstTransactionDate = transactions.length > 0 ? transactions[0].date : null;
  const lastTransactionDate = transactions.length > 0 ? transactions[transactions.length - 1].date : null;

  // calculate daily portfolio change
  const balanceChange = portfolioStateHolding.reduce((acc, curr) => acc + curr.symbolQuote.change * curr.units, 0);
  const balanceChangePrct = holdingsBalance === 0 ? 0 : calculateGrowth(balance, balance - balanceChange);

  const result: PortfolioStateHoldings = {
    numberOfExecutedBuyTransactions,
    numberOfExecutedSellTransactions,
    transactionFees: roundNDigits(transactionFees),
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

/**
 * get partial data for user's current holdings from all previous transactions, where units are more than 0
 *
 * @param transactions - user's transactions
 * @returns
 */
export const getPortfolioStateHoldingBaseUtil = (transactions: PortfolioTransaction[]): PortfolioStateHoldingBase[] => {
  return transactions
    .reduce((acc, curr) => {
      const existingHolding = acc.find((d) => d.symbol === curr.symbol);
      const isSell = curr.transactionType === 'SELL';
      // update existing holding
      if (existingHolding) {
        const newUnits = existingHolding.units + (isSell ? -curr.units : curr.units);
        existingHolding.units = curr.sector === 'CRYPTO' ? roundNDigits(newUnits, 4) : roundNDigits(newUnits);
        existingHolding.invested += roundNDigits(
          isSell ? -(existingHolding.breakEvenPrice * curr.units) : curr.unitPrice * curr.units,
        );
        existingHolding.breakEvenPrice = roundNDigits(existingHolding.invested / existingHolding.units);
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
          breakEvenPrice: curr.unitPrice,
        } satisfies PortfolioStateHoldingBase,
      ];
    }, [] as PortfolioStateHoldingBase[])
    .filter((d) => d.units > 0);
};

export const createEmptyPortfolioState = (startingCash = 0) =>
  ({
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
  }) satisfies PortfolioState;

/**
 * from user's every transaction, get distinct symbols with their first transaction date
 *
 * @param transactions - user's transactions
 * @returns - array of symbols with their first transaction date
 */
export const getTransactionsStartDate = (
  transactions: PortfolioTransaction[],
): { symbol: string; startDate: string }[] => {
  return transactions.reduce(
    (acc, curr) => {
      // check if symbol already exists
      const entry = acc.find((d) => d.symbol === curr.symbol);
      // add new entry if not exists
      if (!entry) {
        return [...acc, { symbol: curr.symbol, startDate: curr.date }];
      }
      // compare dates and update if sooner
      if (isBefore(curr.date, entry.startDate)) {
        return [...acc.filter((d) => d.symbol !== curr.symbol), { symbol: curr.symbol, startDate: curr.date }];
      }
      // else return original
      return acc;
    },
    [] as { symbol: string; startDate: string }[],
  );
};

/**
 * for provided transactions, calculate portfolio growth assets
 *
 * @param transactions - user's transactions (may be filtered out only for selected symbol)
 * @param historicalPrices - historical prices for symbols
 * @returns - portfolio growth assets
 */
export const getPortfolioGrowthAssets = (
  transactions: PortfolioTransaction[],
  historicalPrices: { [key: string]: HistoricalPrice[] },
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

  console.log('PortfolioGrowthService: getPortfolioGrowthAssets', result);

  return result;
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
