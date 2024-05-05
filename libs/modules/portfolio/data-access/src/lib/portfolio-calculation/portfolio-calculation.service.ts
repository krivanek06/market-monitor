import { Injectable, inject } from '@angular/core';
import { MarketApiService } from '@mm/api-client';
import {
  HistoricalPrice,
  HistoricalPriceSymbol,
  PortfolioGrowthAssets,
  PortfolioGrowthAssetsDataItem,
  PortfolioStateHolding,
  PortfolioStateHoldings,
  PortfolioTransaction,
} from '@mm/api-types';
import { ColorScheme, GenericChartSeries, ValueItem } from '@mm/shared/data-access';
import {
  calculateGrowth,
  dateFormatDate,
  fillOutMissingDatesForDate,
  getObjectEntries,
  getPortfolioStateHoldingBaseUtil,
  getPortfolioStateHoldingsUtil,
  getYesterdaysDate,
  roundNDigits,
} from '@mm/shared/general-util';
import { format, isBefore, isSameDay, subMonths, subWeeks, subYears } from 'date-fns';
import { Observable, catchError, firstValueFrom, map, of } from 'rxjs';
import { PortfolioChange, PortfolioGrowth } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PortfolioCalculationService {
  private marketApiService = inject(MarketApiService);

  getPortfolioStateHoldings(
    startingCash: number,
    transactions: PortfolioTransaction[],
  ): Observable<PortfolioStateHoldings> {
    // get partial holdings calculations
    const holdingsBase = getPortfolioStateHoldingBaseUtil(transactions);
    const holdingSymbols = holdingsBase.map((d) => d.symbol);

    console.log(`PortfolioGrowthService: getPortfolioState`, holdingSymbols, holdingsBase, transactions);

    // get symbol summaries from API
    return this.marketApiService
      .getSymbolQuotes(holdingSymbols)
      .pipe(map((summaries) => getPortfolioStateHoldingsUtil(transactions, holdingsBase, summaries, startingCash)));
  }

  getPortfolioGrowth(portfolioAssets: PortfolioGrowthAssets[], startingCashValue = 0): PortfolioGrowth[] {
    // get holidays
    const allHolidays = this.marketApiService.getIsMarketOpenSignal()?.allHolidays ?? [];

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
      if (allHolidays.includes(gDate)) {
        continue;
      }

      // initial object
      const portfolioItem: PortfolioGrowth = {
        date: gDate,
        breakEvenValue: 0,
        marketTotalValue: 0,
        totalBalanceValue: startingCashValue,
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
        portfolioItem.marketTotalValue += currentPortfolioAsset.marketTotalValue;
        portfolioItem.breakEvenValue += currentPortfolioAsset.breakEvenValue;
        portfolioItem.totalBalanceValue +=
          currentPortfolioAsset.marketTotalValue - currentPortfolioAsset.breakEvenValue;
      }

      // add accumulated return to total balance
      portfolioItem.totalBalanceValue += Array.from(accumulatedReturn.entries()).reduce(
        (acc, curr) => acc + curr[1],
        0,
      );

      // save result
      result.push(portfolioItem);
    }

    return result;
  }

  /**
   * from growth data create a time period change
   *
   * TODO: fix for better logic than subtracting exact dates from today
   * TODO: maybe getting the average previous monthly data and comparing to today's data
   *
   * @param growthData
   * @returns
   */
  getPortfolioChange(growthData: PortfolioGrowth[]): PortfolioChange {
    console.log('getPortfolioChange', growthData);
    // reverse data to start from DESC
    const reversedData = growthData.reduce((acc, curr) => [curr, ...acc], [] as PortfolioGrowth[]);
    const today = new Date();

    // return default values if no data
    if (reversedData.length <= 1) {
      return {
        '1_day': null,
        '1_week': null,
        '2_week': null,
        '3_week': null,
        '1_month': null,
        '3_month': null,
        '6_month': null,
        '1_year': null,
        total: null,
      };
    }

    const todayChange = reversedData[0].totalBalanceValue;

    // construct dates
    const week1ChangeDate = dateFormatDate(subWeeks(today, 1));
    const week2ChangeDate = dateFormatDate(subWeeks(today, 2));
    const week3ChangeDate = dateFormatDate(subWeeks(today, 3));
    const month1ChangeDate = dateFormatDate(subMonths(today, 1));
    const month3ChangeDate = dateFormatDate(subMonths(today, 3));
    const month6ChangeDate = dateFormatDate(subMonths(today, 6));
    const year1ChangeDate = dateFormatDate(subYears(today, 1));

    // find index for data which date's are one smaller than the date we are looking for
    const week1ChangeIndex = reversedData.findIndex((d) => d.date <= week1ChangeDate);
    const week2ChangeIndex = reversedData.findIndex((d) => d.date <= week2ChangeDate);
    const week3ChangeIndex = reversedData.findIndex((d) => d.date <= week3ChangeDate);
    const month1ChangeIndex = reversedData.findIndex((d) => d.date <= month1ChangeDate);
    const month3ChangeIndex = reversedData.findIndex((d) => d.date <= month3ChangeDate);
    const month6ChangeIndex = reversedData.findIndex((d) => d.date <= month6ChangeDate);
    const year1ChangeIndex = reversedData.findIndex((d) => d.date <= year1ChangeDate);

    // create helper function to create change value
    const createPortfolioChangeValue = (growth?: PortfolioGrowth | null): ValueItem | null =>
      !growth
        ? null
        : ({
            value: roundNDigits(todayChange - growth.totalBalanceValue, 2),
            valuePrct: roundNDigits(calculateGrowth(todayChange, growth.totalBalanceValue), 4),
          } satisfies ValueItem);

    // calculate change for each time period
    const result: PortfolioChange = {
      '1_day': createPortfolioChangeValue(reversedData[1]),
      '1_week': createPortfolioChangeValue(reversedData[week1ChangeIndex]),
      '2_week': createPortfolioChangeValue(reversedData[week2ChangeIndex]),
      '3_week': createPortfolioChangeValue(reversedData[week3ChangeIndex]),
      '1_month': createPortfolioChangeValue(reversedData[month1ChangeIndex]),
      '3_month': createPortfolioChangeValue(reversedData[month3ChangeIndex]),
      '6_month': createPortfolioChangeValue(reversedData[month6ChangeIndex]),
      '1_year': createPortfolioChangeValue(reversedData[year1ChangeIndex]),
      total: createPortfolioChangeValue(reversedData[reversedData.length - 1]),
    };

    console.log('daily result', result);
    return result;
  }

  /**
   * generate pie chart based on holdings representing sector allocation
   *
   * @param holdings
   * @returns
   */
  getPortfolioSectorAllocationPieChart(holdings: PortfolioStateHolding[]): GenericChartSeries<'pie'> {
    const allocations = holdings.reduce(
      (acc, curr) => {
        const dataKey = curr.sector ?? curr.symbolType;
        const existingData = acc[dataKey];
        if (existingData) {
          acc[dataKey] += curr.symbolQuote.price * curr.units;
        } else {
          acc[dataKey] = curr.symbolQuote.price * curr.units;
        }
        return acc;
      },
      {} as { [name: string]: number },
    );

    const chartData = Object.entries(allocations)
      .map(([name, value]) => ({
        y: Number(value),
        name,
      }))
      .sort((a, b) => b.y - a.y);

    return {
      name: 'Sector Allocation',
      type: 'pie',
      innerSize: '35%',
      data: chartData,
    };
  }

  getPortfolioHoldingBubbleChart(holdings: PortfolioStateHolding[]): GenericChartSeries<'packedbubble'>[] {
    // limit bubbles, show rest as 'others'
    const dataLimit = 50;
    // sort symbols by value and divide them by first and rest
    const sortedHoldings = [...holdings].sort((a, b) => b.symbolQuote.price * b.units - a.symbolQuote.price * a.units);
    const firstNData = sortedHoldings.slice(0, dataLimit);
    const restData = sortedHoldings.slice(dataLimit);

    // divide symbols into sectors
    const sectorsDivider = firstNData.reduce(
      (acc, curr) => {
        return {
          ...acc,
          [curr.sector]: [
            ...(acc[curr.sector] ?? []),
            {
              name: curr.symbol,
              value: curr.symbolQuote.price * curr.units,
            },
          ],
        };
      },
      {} as {
        [K in string]: {
          name: string; // symbol
          value: number; // symbol current market value
        }[];
      },
    );

    // from sectors create series
    const sectorDividerSeries = getObjectEntries(sectorsDivider).map(
      ([name, data]) =>
        ({
          type: 'packedbubble',
          name,
          data,
          dataLabels: {
            color: ColorScheme.GRAY_DARK_VAR,
          },
          additionalData: {
            showCurrencySign: true,
          },
        }) satisfies GenericChartSeries<'packedbubble'>,
    );

    // add rest data as 'others'
    const restDataSeries = {
      type: 'packedbubble',
      name: 'Others',
      data: restData.map((d) => ({
        name: d.symbol,
        value: d.symbolQuote.price * d.units,
        dataLabels: {
          color: ColorScheme.GRAY_DARK_VAR,
        },
        additionalData: {
          showCurrencySign: true,
        },
      })),
    } satisfies GenericChartSeries<'packedbubble'>;

    return [...sectorDividerSeries, restDataSeries];
  }

  /**
   * generate pie chart based on provided holdings, where only the first N holdings name are used
   * and the rest are grouped into "Other" category
   *
   * @param holdings
   * @returns
   */
  getPortfolioAssetAllocationPieChart(holdings: PortfolioStateHolding[]): GenericChartSeries<'pie'> {
    const visibleData = 8;
    const allocations = holdings.reduce(
      (acc, curr) => {
        const existingData = acc[curr.symbol];
        if (existingData) {
          acc[curr.symbol] += curr.symbolQuote.price * curr.units;
        } else {
          acc[curr.symbol] = curr.symbolQuote.price * curr.units;
        }
        return acc;
      },
      {} as { [name: string]: number },
    );

    const chartData = Object.entries(allocations)
      .map(([name, value]) => ({
        y: Number(value),
        name,
      }))
      .sort((a, b) => b.y - a.y);

    // combine last elements into "Other" category
    const otherCategory = chartData.slice(visibleData).reduce(
      (acc, curr) => {
        acc.y += curr.y;
        return acc;
      },
      { name: 'Other', y: 0 },
    );

    // combine first N elements with "Other" category
    const resultData = [...chartData.slice(0, visibleData), otherCategory];

    return {
      name: 'Portfolio Allocation',
      type: 'pie',
      innerSize: '35%',
      data: holdings.length > 0 ? resultData : [],
    };
  }

  /**
   * method used to return growth for each asset based on the dates owned.
   * the `data` contains the date and the value of the asset from the first date owned until today or fully sold
   *
   * @param transactions - executed transactions by user
   * @returns - an array of {symbol: string, data: PortfolioGrowthAssetsDataItem[]}
   */
  async getPortfolioGrowthAssets(transactions: PortfolioTransaction[]): Promise<PortfolioGrowthAssets[]> {
    const historicalPrices = await this.getHistoricalPricesForTransactionsSymbols(transactions);
    const symbols = Object.keys(historicalPrices);

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

        // check if historical prices first date is not after first transaction date
        // transaction was weekend/holiday but prices are from next working date
        const firstDate = symbolHistoricalPrice[0].date;

        // internal helper
        const isFirstTransactionBeforeFirstDate = isBefore(symbolTransactions[0].date, firstDate);
        const aggregator = {
          units: isFirstTransactionBeforeFirstDate ? symbolTransactions[0].units : 0,
          index: isFirstTransactionBeforeFirstDate ? 1 : 0,
          breakEvenPrice: isFirstTransactionBeforeFirstDate ? symbolTransactions[0].unitPrice : 0,
          accumulatedReturn: 0,
        };

        // loop though prices of specific symbol and calculate invested value and market total value
        const growthAssetItems = symbolHistoricalPrice.map((historicalPrice) => {
          // modify the aggregator for every transaction that happened on that date
          // can be multiple transactions on the same day for the same symbol
          while (
            !!symbolTransactions[aggregator.index] &&
            isSameDay(symbolTransactions[aggregator.index].date, historicalPrice.date)
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

            // calculate accumulated return
            aggregator.accumulatedReturn += roundNDigits(transaction.returnValue - transaction.transactionFees);
          }

          const breakEvenValue = roundNDigits(aggregator.units * aggregator.breakEvenPrice);
          const marketTotalValue = roundNDigits(aggregator.units * historicalPrice.close);

          return {
            breakEvenValue: breakEvenValue,
            date: historicalPrice.date,
            units: aggregator.units,
            marketTotalValue: marketTotalValue,
            profit: roundNDigits(marketTotalValue - breakEvenValue + aggregator.accumulatedReturn),
            accumulatedReturn: aggregator.accumulatedReturn,
          } satisfies PortfolioGrowthAssetsDataItem;
        });

        return {
          symbol,
          // remove data with 0 market value, however always keep last one (it has a different profit since it was SOLD)
          data: growthAssetItems.filter(
            (d, i) => !(d.marketTotalValue === 0 && growthAssetItems[i - 1]?.marketTotalValue === 0),
          ),
        } satisfies PortfolioGrowthAssets;
      })
      // remove undefined or symbols which were bought and sold on the same day
      .filter((d): d is PortfolioGrowthAssets => !!d && d.data.length > 0);

    console.log('PortfolioGrowthService: getPortfolioGrowthAssets', result);

    return result;
  }

  /**
   *
   * @param transactions
   * @returns distinct symbols with historical prices
   */
  private async getHistoricalPricesForTransactionsSymbols(
    transactions: PortfolioTransaction[],
  ): Promise<{ [key: string]: HistoricalPrice[] }> {
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
            .getHistoricalPricesDateRange(transaction.symbol, format(transaction.startDate, 'yyyy-MM-dd'), yesterDay)
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

    return historicalPrices;
  }
}
