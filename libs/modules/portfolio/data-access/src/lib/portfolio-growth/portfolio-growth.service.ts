import { Injectable } from '@angular/core';
import { MarketApiService } from '@market-monitor/api-client';
import {
  HistoricalPrice,
  HistoricalPriceSymbol,
  PortfolioGrowthAssets,
  PortfolioGrowthAssetsDataItem,
  PortfolioStateHoldings,
  PortfolioTransaction,
} from '@market-monitor/api-types';
import {
  getPortfolioStateHoldingBaseUtil,
  getPortfolioStateHoldingsUtil,
  roundNDigits,
} from '@market-monitor/shared/features/general-util';
import { format, isBefore, isSameDay, subDays } from 'date-fns';
import { Observable, catchError, firstValueFrom, map, of } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PortfolioGrowthService {
  constructor(private marketApiService: MarketApiService) {}

  getPortfolioStateHoldings(
    transactions: PortfolioTransaction[],
    startingCash: number = 0,
  ): Observable<PortfolioStateHoldings> {
    console.log(`PortfolioGrowthService: getPortfolioState`);

    // get partial holdings calculations
    const partialHoldings = getPortfolioStateHoldingBaseUtil(transactions);
    const partialHoldingSymbols = partialHoldings.map((d) => d.symbol);

    // get symbol summaries from API
    return this.marketApiService
      .getSymbolSummaries(partialHoldingSymbols)
      .pipe(map((summaries) => getPortfolioStateHoldingsUtil(startingCash, transactions, partialHoldings, summaries)));
  }

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
          units: symbolTransactions[0].units,
          index: 0,
          breakEvenPrice: symbolTransactions[0].unitPrice,
        };
        const growthAssetItems = symbolHistoricalPrice.map((historicalPrice) => {
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
              ? (aggregator.units * aggregator.breakEvenPrice + nextTransaction.units * nextTransaction.unitPrice) /
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
      })
      .filter((d): d is PortfolioGrowthAssets => !!d);
    console.log('result', result);
    return result;
  }
}
