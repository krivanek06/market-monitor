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
import { Observable, firstValueFrom, map, tap } from 'rxjs';
import { PortfolioState, PortfolioStateHolding } from '../models';
import { PortfolioCalculationService } from '../portfolio-calculation/portfolio-calculation.service';

@Injectable({
  providedIn: 'root',
})
export class PortfolioGrowthService {
  constructor(
    private marketApiService: MarketApiService,
    private portfolioCalculationService: PortfolioCalculationService,
  ) {}

  getPortfolioState(portfolioTransactions: UserPortfolioTransaction): Observable<PortfolioState> {
    console.log(`PortfolioGrowthService: getPortfolioState`);
    const transactions = portfolioTransactions.transactions;

    // todo: remove/add transaction total values into this
    // accumulate cash on hand from deposits
    const cashOnHandFromDeposit = portfolioTransactions.startingCash ?? 0;
    const isCashActive = cashOnHandFromDeposit !== 0;
    // accumulate cash on hand from transactions
    const cashOnHandTransactions = transactions.reduce(
      (acc, curr) =>
        curr.transactionType === 'BUY' ? acc - curr.unitPrice * curr.units : acc + curr.unitPrice * curr.units,
      0,
    );
    const numberOfExecutedBuyTransactions = transactions.filter((t) => t.transactionType === 'BUY').length;
    const numberOfExecutedSellTransactions = transactions.filter((t) => t.transactionType === 'SELL').length;
    const transactionFees = transactions.reduce((acc, curr) => acc + curr.transactionFees, 0);

    // get partial holdings calculations
    const partialHoldings = this.portfolioCalculationService.getPortfolioStateHoldingPartial(transactions);
    const partialHoldingSymbols = partialHoldings.map((d) => d.symbol);

    // get symbol summaries from API
    return this.marketApiService.getSymbolSummaries(partialHoldingSymbols).pipe(
      // TODO: maybe use some logging service
      tap((summaries) => console.log(`Sending ${partialHoldings.length}, receiving: ${summaries.length}`)),
      // map summaries into holdings data
      map((summaries) =>
        summaries
          .map((symbolSummary) => {
            const holding = partialHoldings.find((d) => d.symbol === symbolSummary.id);
            if (!holding) {
              console.log(`Holding not found for symbol ${symbolSummary.id}`);
              return null;
            }
            return {
              ...holding,
              breakEvenPrice: roundNDigits(holding.invested / holding.units, 2),
              symbolSummary,
            } satisfies PortfolioStateHolding;
          })
          // filter out nulls
          .filter((d): d is PortfolioStateHolding => !!d),
      ),
      map((holdings) => {
        const invested = holdings.reduce((acc, curr) => acc + curr.invested, 0);
        const userBalance = invested + cashOnHandFromDeposit + (isCashActive ? cashOnHandTransactions : 0);
        const holdingsBalance = holdings.reduce((acc, curr) => acc + curr.symbolSummary.quote.price * curr.units, 0);
        const totalGainsValue = roundNDigits(holdingsBalance - invested, 2);
        const totalGainsPercentage = roundNDigits((holdingsBalance - holdingsBalance) / holdingsBalance, 4);

        const result: PortfolioState = {
          numberOfExecutedBuyTransactions,
          numberOfExecutedSellTransactions,
          transactionFees,
          cashOnHand: isCashActive ? cashOnHandFromDeposit + cashOnHandTransactions : 0,
          userBalance,
          invested,
          holdings,
          holdingsBalance,
          totalGainsValue,
          totalGainsPercentage,
        };

        return result;
      }),
    );
  }

  async getPortfolioGrowthAssets(userTransactions: UserPortfolioTransaction): Promise<PortfolioGrowthAssets[]> {
    console.log(`PortfolioGrowthService: getPortfolioGrowthAssets`);
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
          this.marketApiService
            .getHistoricalPricesDateRange(
              transaction.symbol,
              format(new Date(transaction.startDate), 'yyyy-MM-dd'),
              yesterDay,
            )
            .pipe(map((res) => ({ symbol: transaction.symbol, data: res }) satisfies HistoricalPriceSymbol)),
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
        const symbolTransactions = userTransactions.transactions
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
