import { Injectable } from '@angular/core';
import { MarketApiService } from '@market-monitor/api-client';
import {
  HistoricalPrice,
  HistoricalPriceSymbol,
  PortfolioGrowthAssets,
  PortfolioGrowthAssetsDataItem,
  UserPortfolioTransaction,
} from '@market-monitor/api-types';
import { roundNDigits } from '@market-monitor/shared/utils-general';
import { format, isBefore, isSameDay, subDays } from 'date-fns';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PortfolioGrowthService {
  constructor(private marketApiService: MarketApiService) {}

  async getPortfolioGrowthAssetsByUserId(userTransactions: UserPortfolioTransaction): Promise<PortfolioGrowthAssets[]> {
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
      transactionStart.map((transaction) =>
        firstValueFrom(
          this.marketApiService.getHistoricalPricesDateRange(transaction.symbol, transaction.startDate, yesterDay),
        ),
      ),
    );

    // get fulfilled promises or fulfilled promises with null
    const incorrectData = historicalPricesPromise
      .filter((d): d is PromiseRejectedResult => d.status === 'rejected' || d.value === null)
      .map((d) => d.reason);

    // TODO: maybe use some logging service
    console.log('incorrectData', incorrectData);

    // get fulfilled promises and create object with symbol as key
    const historicalPrices = historicalPricesPromise
      .filter((d) => d.status === 'fulfilled')
      .map((d) => d.status === 'fulfilled' && d.value)
      .filter((d): d is HistoricalPriceSymbol => d !== null)
      .reduce((acc, curr) => ({ ...acc, [curr.symbol]: curr.data }), {} as { [key: string]: HistoricalPrice[] });

    const distinctSymbols = transactionStart.map((d) => d.symbol);

    // create portfolio growth assets
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
      const aggregator = {
        units: symbolTransactions[0].units,
        index: 0,
        breakEvenPrice: symbolTransactions[0].unitPrice,
      };
      const growthAssetItems = historicalPrices[symbol].slice(historicalPriceIndex).map((historicalPrice) => {
        // check if the next transaction data is before the date then increase index
        if (
          !!symbolTransactions[aggregator.index + 1] &&
          isSameDay(new Date(symbolTransactions[aggregator.index + 1].date), new Date(historicalPrice.date))
        ) {
          aggregator.index += 1;
          const nextTransaction = symbolTransactions[aggregator.index];
          const isBuy = nextTransaction.transactionType === 'BUY';
          // change break even price
          aggregator.breakEvenPrice = isBuy
            ? (aggregator.breakEvenPrice * aggregator.units + historicalPrice.close * nextTransaction.unitPrice) /
              (aggregator.units + nextTransaction.units)
            : aggregator.breakEvenPrice;

          // add or subtract units depending on transaction type
          aggregator.units += isBuy ? nextTransaction.units : -nextTransaction.units;
        }

        return {
          investedValue: roundNDigits(aggregator.units * aggregator.breakEvenPrice, 2),
          date: historicalPrice.date,
          units: aggregator.units,
          marketTotalValue: roundNDigits(aggregator.units * historicalPrice.close, 2),
        } satisfies PortfolioGrowthAssetsDataItem;
      });

      const growthAssetsNonNullUnits = growthAssetItems.filter((d) => d.units > 0);
      return {
        symbol,
        data: growthAssetsNonNullUnits,
      } satisfies PortfolioGrowthAssets;
    });

    return result;
  }
}
