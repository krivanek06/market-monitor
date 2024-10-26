import {
  HistoricalPrice,
  PortfolioGrowthAssets,
  PortfolioGrowthAssetsDataItem,
  PortfolioState,
  PortfolioTransaction,
} from '@mm/api-types';
import { isSameDay } from 'date-fns';
import { fillOutMissingDatesForDate, getCurrentDateDefaultFormat, getYesterdaysDate } from './date-service.util';
import { roundNDigits } from './general-function.util';

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

  return result;
};
