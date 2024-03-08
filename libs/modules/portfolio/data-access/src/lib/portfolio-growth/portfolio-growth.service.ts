import { Injectable, inject } from '@angular/core';
import { MarketApiService } from '@market-monitor/api-client';
import {
  HistoricalPrice,
  HistoricalPriceSymbol,
  PortfolioGrowthAssets,
  PortfolioGrowthAssetsDataItem,
  PortfolioState,
  PortfolioStateHoldings,
  PortfolioTransaction,
} from '@market-monitor/api-types';
import {
  getPortfolioStateHoldingBaseUtil,
  getPortfolioStateHoldingsUtil,
  getYesterdaysDate,
  roundNDigits,
} from '@market-monitor/shared/features/general-util';
import { format, isBefore, isSameDay } from 'date-fns';
import { Observable, catchError, firstValueFrom, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PortfolioGrowthService {
  private marketApiService = inject(MarketApiService);

  getPortfolioStateHoldings(
    transactions: PortfolioTransaction[],
    previousPortfolioState: PortfolioState,
  ): Observable<PortfolioStateHoldings> {
    console.log(`PortfolioGrowthService: getPortfolioState`, transactions, previousPortfolioState);

    // get partial holdings calculations
    const partialHoldings = getPortfolioStateHoldingBaseUtil(transactions);
    const partialHoldingSymbols = partialHoldings.map((d) => d.symbol);

    // get symbol summaries from API
    return this.marketApiService
      .getSymbolSummaries(partialHoldingSymbols)
      .pipe(
        map((summaries) =>
          getPortfolioStateHoldingsUtil(previousPortfolioState, transactions, partialHoldings, summaries),
        ),
      );
  }

  /**
   * method used to return growth for each asset based on the dates owned.
   * the `data` contains the date and the value of the asset from the first date owned until today or fully sold
   *
   * @param transactions - executed transactions by user
   * @returns - an array of {symbol: string, data: PortfolioGrowthAssetsDataItem[]}
   */
  async getPortfolioGrowthAssets(transactions: PortfolioTransaction[]): Promise<PortfolioGrowthAssets[]> {
    console.log(`PortfolioGrowthService: getPortfolioGrowthAssets`, transactions);
    // from transactions get all distinct symbols with soonest date of transaction
    const transactionStart = transactions.reduce(
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

    // load historical prices for all holdings
    const yesterDay = getYesterdaysDate();
    const historicalPricesPromise = await Promise.allSettled(
      transactionStart.map((transaction) =>
        firstValueFrom(
          this.marketApiService
            .getHistoricalPricesDateRange(
              transaction.symbol,
              format(new Date(transaction.startDate), 'yyyy-MM-dd'),
              yesterDay,
            )
            .pipe(
              map((res) => ({ symbol: transaction.symbol, data: res }) satisfies HistoricalPriceSymbol),
              catchError((err) => {
                console.log(err);
                return of([]);
              }),
            ),
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
      .filter((d): d is PromiseFulfilledResult<HistoricalPriceSymbol> => d.status === 'fulfilled')
      .map((d) => d.value)
      .reduce((acc, curr) => ({ ...acc, [curr.symbol]: curr.data }), {} as { [key: string]: HistoricalPrice[] });

    // create portfolio growth assets
    const result: PortfolioGrowthAssets[] = transactionStart
      .map((d) => d.symbol)
      .map((symbol) => {
        const symbolHistoricalPrice = historicalPrices[symbol];

        if (!symbolHistoricalPrice) {
          console.log(`Missing historical prices for ${symbol}`);
          return null;
        }

        // get all transactions for this symbol in ASC order by date
        const symbolTransactions = transactions
          .filter((d) => d.symbol === symbol)
          .sort((a, b) => (isBefore(new Date(a.date), new Date(b.date)) ? -1 : 1));

        // internal helper
        const aggregator = {
          units: 0,
          index: 0,
          breakEvenPrice: 0,
        };

        // loop though prices of specific symbol and calculate invested value and market total value
        const growthAssetItems = symbolHistoricalPrice.map((historicalPrice) => {
          // modify the aggregator for every transaction that happened on that date
          // can be multiple transactions on the same day for the same symbol
          while (
            !!symbolTransactions[aggregator.index] &&
            isSameDay(new Date(symbolTransactions[aggregator.index].date), new Date(historicalPrice.date))
          ) {
            const transaction = symbolTransactions[aggregator.index];
            const isBuy = transaction.transactionType === 'BUY';

            // change break even price
            aggregator.breakEvenPrice = isBuy
              ? (aggregator.units * aggregator.breakEvenPrice + transaction.units * transaction.unitPrice) /
                (aggregator.units + transaction.units)
              : aggregator.breakEvenPrice;

            // add or subtract units depending on transaction type
            aggregator.units += isBuy ? transaction.units : -transaction.units;

            // increment next transaction index
            aggregator.index += 1;
          }

          return {
            investedValue: roundNDigits(aggregator.units * aggregator.breakEvenPrice),
            date: historicalPrice.date,
            units: aggregator.units,
            marketTotalValue: roundNDigits(aggregator.units * historicalPrice.close),
          } satisfies PortfolioGrowthAssetsDataItem;
        });

        const growthAssetsNonNullUnits = growthAssetItems.filter((d) => d.units > 0);
        return {
          symbol,
          data: growthAssetsNonNullUnits,
        } satisfies PortfolioGrowthAssets;
      })
      // remove undefined or symbols which were bought and sold on the same day
      .filter((d): d is PortfolioGrowthAssets => !!d && d.data.length > 0);

    console.log('PortfolioGrowthService: getPortfolioGrowthAssets [result]', result);
    return result;
  }
}
