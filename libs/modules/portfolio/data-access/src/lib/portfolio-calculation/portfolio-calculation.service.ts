import { Injectable, inject } from '@angular/core';
import { MarketApiService } from '@mm/api-client';
import {
  HistoricalPrice,
  HistoricalPriceSymbol,
  PortfolioGrowth,
  PortfolioGrowthAssets,
  PortfolioState,
  PortfolioStateHolding,
  PortfolioStateHoldingBase,
  PortfolioStateHoldings,
  PortfolioTransaction,
} from '@mm/api-types';
import { ColorScheme, GenericChartSeries, ValueItem } from '@mm/shared/data-access';
import {
  calculateGrowth,
  dateFormatDate,
  getObjectEntries,
  getPortfolioGrowthAssets,
  getTransactionsStartDate,
  getYesterdaysDate,
  roundNDigits,
} from '@mm/shared/general-util';
import { format, subMonths, subWeeks, subYears } from 'date-fns';
import { Observable, catchError, firstValueFrom, map, of } from 'rxjs';
import { PortfolioChange } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PortfolioCalculationService {
  private readonly marketApiService = inject(MarketApiService);

  /**
   * recalculate user's portfolio state based on transactions, because the balance (value of investments) can change
   * in the DB may be outdated data, so we need to recalculate it
   *
   * @returns - recalculated user's portfolio state based on transactions
   */
  getPortfolioStateHoldings(
    portfolioState: PortfolioState,
    holdings: PortfolioStateHoldingBase[],
  ): Observable<PortfolioStateHoldings> {
    const holdingSymbols = holdings.map((d) => d.symbol);

    console.log(`PortfolioGrowthService: getPortfolioState`, portfolioState);

    // get symbol summaries from API
    return this.marketApiService.getSymbolQuotes(holdingSymbols).pipe(
      map(
        (quotes) =>
          quotes
            .map((quote) => {
              const holding = holdings.find((d) => d.symbol === quote.symbol);
              // this should never happen
              if (!holding) {
                console.log(`Holding not found for symbol ${quote.symbol}`);
                return null;
              }
              return {
                ...holding,
                invested: roundNDigits(holding.invested),
                breakEvenPrice:
                  holding.units !== 0 ? roundNDigits(holding.invested / holding.units, 6) : holding.breakEvenPrice,
                weight: roundNDigits(holding.invested / portfolioState.invested, 6),
                symbolQuote: quote,
              } satisfies PortfolioStateHolding;
            })
            .filter((d) => !!d) as PortfolioStateHolding[],
      ),
      map((holdings) => ({
        ...portfolioState,
        holdings,
      })),
    );
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

    const todayChange = reversedData[0].balanceTotal;

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
            value: roundNDigits(todayChange - growth.balanceTotal, 2),
            valuePrct: roundNDigits(calculateGrowth(todayChange, growth.balanceTotal), 4),
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
      innerSize: '45%',
      data: chartData,
    };
  }

  /**
   *
   * @param transactions - executed transactions by user
   * @returns - array of distinct symbols user ever transacted
   */
  getTransactionSymbols(transactions: PortfolioTransaction[]): {
    symbol: string;
    displaySymbol: string;
  }[] {
    const symbolMap = transactions.reduce(
      (acc, curr) =>
        curr.symbol in acc
          ? acc
          : { ...acc, [curr.symbol]: { symbol: curr.symbol, displaySymbol: curr.displaySymbol ?? curr.symbol } },

      {} as {
        [key: string]: {
          symbol: string;
          displaySymbol: string;
        };
      },
    );

    // get only the values
    return Object.entries(symbolMap).map(([_, value]) => value);
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
          acc[curr.symbolQuote.displaySymbol] += curr.symbolQuote.price * curr.units;
        } else {
          acc[curr.symbolQuote.displaySymbol] = curr.symbolQuote.price * curr.units;
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
      innerSize: '45%',
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
    // from transactions get all distinct symbols with soonest date of transaction
    const transactionStart = getTransactionsStartDate(transactions);

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
    const incorrectData = historicalPricesPromise.filter((d) => d.status === 'rejected').map((d) => d.reason);

    // TODO: maybe use some logging service
    console.log('incorrectData', incorrectData);

    // get fulfilled promises and create object with symbol as key
    const historicalPrices = historicalPricesPromise
      .filter((d): d is PromiseFulfilledResult<HistoricalPriceSymbol> => d.status === 'fulfilled')
      .map((d) => d.value)
      .reduce((acc, curr) => ({ ...acc, [curr.symbol]: curr.data }), {} as { [key: string]: HistoricalPrice[] });

    return getPortfolioGrowthAssets(transactions, historicalPrices);
  }
}
