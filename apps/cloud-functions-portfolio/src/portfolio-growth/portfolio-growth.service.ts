import { getPriceOnDateRange } from '@market-monitor/api-external';
import {
  HistoricalPrice,
  HistoricalPriceSymbol,
  PortfolioGrowthAssets,
  PortfolioGrowthAssetsDataItem,
} from '@market-monitor/api-types';
import { Injectable } from '@nestjs/common';
import { eachDayOfInterval, format, isBefore, isSameDay, subDays } from 'date-fns';
import { ApiService } from '../api/api.service';

@Injectable()
export class PortfolioGrowthService {
  constructor(private apiService: ApiService) {}
  async getPortfolioGrowthAssetsByUserId(userId: string): Promise<PortfolioGrowthAssets[]> {
    // load data
    const user = await this.apiService.getUser(userId);
    const userTransactions = await this.apiService.getUserPortfolioTransaction(userId);

    // throw error if no user
    if (!user) {
      throw new Error('No user found');
    }

    // from transactions get all distinct symbols with soonest date of transaction
    const transactionStart = userTransactions.transactions.reduce(
      (acc, curr) => {
        // check if symbol already exists
        const entry = acc.find((d) => d.symbol === curr.symbol);
        // add new entry if not exists
        if (!entry) {
          return [...acc, { symbol: curr.symbol, startDate: curr.date }];
        }
        // compare dates and update if sooner
        if (isBefore(new Date(curr.date), new Date(entry.startDate))) {
          return [...acc.filter((d) => d.symbol !== curr.symbol), { symbol: curr.symbol, startDate: curr.date }];
        }
        // else return original
        return acc;
      },
      [] as { symbol: string; startDate: string }[],
    );

    // load historical prices for all holdings
    const yesterDay = format(subDays(new Date(), 1), 'yyyy-MM-dd');
    const historicalPricesPromise = await Promise.allSettled(
      transactionStart.map((transaction) => getPriceOnDateRange(transaction.symbol, transaction.startDate, yesterDay)),
    );

    // get fulfilled promises or fulfilled promises with null
    const incorrectData = historicalPricesPromise
      .filter((d): d is PromiseRejectedResult => d.status === 'rejected' || d.value === null)
      .map((d) => d.reason);

    console.warn('incorrectData', incorrectData);

    // get fulfilled promises and create object with symbol as key
    const historicalPrices = historicalPricesPromise
      .filter((d) => d.status === 'fulfilled')
      .map((d) => d.status === 'fulfilled' && d.value)
      .filter((d): d is HistoricalPriceSymbol => d !== null)
      .reduce((acc, curr) => ({ ...acc, [curr.symbol]: curr.data }), {} as { [key: string]: HistoricalPrice[] });

    const distinctSymbols = transactionStart.map((d) => d.symbol);

    // create portfolio growth assets
    // todo: this may be slow because of constant converting string to date ?
    const result: PortfolioGrowthAssets[] = distinctSymbols.map((symbol) => {
      // get all transactions for this symbol
      const symbolTransactions = userTransactions.transactions
        .filter((d) => d.symbol === symbol)
        .sort((a, b) => (isBefore(new Date(a.date), new Date(b.date)) ? -1 : 1));

      // get the index of historical prices to match the first transaction date
      const historicalPriceIndex = historicalPrices[symbol].findIndex((d) =>
        isSameDay(new Date(d.date), new Date(symbolTransactions[0].date)),
      );

      // internal helper
      const aggregator = { units: symbolTransactions[0].units, index: 0 };
      const growthAssetItems = historicalPrices[symbol].slice(historicalPriceIndex).map((historicalPrice) => {
        // check if the next transaction data is before the date then increase index
        if (
          !symbolTransactions[aggregator.index + 1] &&
          isBefore(new Date(symbolTransactions[aggregator.index].date), new Date(historicalPrice.date))
        ) {
          aggregator.index += 1;
          aggregator.units += symbolTransactions[aggregator.index].units;
        }

        return {
          price: historicalPrice.close,
          date: historicalPrice.date,
          units: aggregator.units,
          totalValue: aggregator.units * historicalPrice.close,
        } satisfies PortfolioGrowthAssetsDataItem;
      });

      return {
        symbol,
        data: growthAssetItems,
      } satisfies PortfolioGrowthAssets;
    });

    return result;
  }

  private generateDatesArray = (start: string, end: string): string[] => {
    const datesArray = eachDayOfInterval({ start: new Date(start), end: new Date(end) });
    const datesArrayFormatted = datesArray.map((date) => format(date, 'yyyy-MM-dd'));
    return datesArrayFormatted;
  };
}
