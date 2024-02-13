import { Injectable } from '@angular/core';
import {
  PortfolioGrowthAssets,
  PortfolioState,
  PortfolioStateHolding,
  PortfolioTransaction,
} from '@market-monitor/api-types';
import { ColorScheme, GenericChartSeries, ValueItem } from '@market-monitor/shared/data-access';
import {
  calculateGrowth,
  dateFormatDate,
  getObjectEntries,
  roundNDigits,
} from '@market-monitor/shared/features/general-util';
import { subMonths, subWeeks, subYears } from 'date-fns';
import { PortfolioChange, PortfolioGrowth, PortfolioTransactionToDate } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PortfolioCalculationService {
  getPortfolioGrowthFromPortfolioState(data: PortfolioState[]): PortfolioGrowth[] {
    return data.map((portfolioStatePerDay) => ({
      date: portfolioStatePerDay.date,
      investedValue: portfolioStatePerDay.invested,
      marketTotalValue: portfolioStatePerDay.holdingsBalance,
      totalBalanceValue: portfolioStatePerDay.balance,
    }));
  }

  getPortfolioGrowth(data: PortfolioGrowthAssets[], startingCashValue = 0): PortfolioGrowth[] {
    return data.reduce((acc, curr) => {
      curr.data.forEach((dataItem) => {
        // find index of element with same date
        const elementIndex = acc.findIndex((el) => el.date === dataItem.date);

        // initial object
        const portfolioItem: PortfolioGrowth = {
          date: dataItem.date,
          investedValue: dataItem.investedValue,
          marketTotalValue: dataItem.marketTotalValue,
          totalBalanceValue: dataItem.marketTotalValue - dataItem.investedValue,
        };

        // if elementIndex exists, add value to it => different symbol, same date
        if (elementIndex > -1) {
          acc[elementIndex].investedValue += portfolioItem.investedValue;
          acc[elementIndex].marketTotalValue += portfolioItem.marketTotalValue;
          acc[elementIndex].totalBalanceValue += portfolioItem.totalBalanceValue;
          return;
        }

        // add starting cash only once
        portfolioItem.totalBalanceValue += startingCashValue;

        if (acc.length === 0 || dataItem.date < acc[0].date) {
          // data is not yet in the array, add it to the start
          acc = [portfolioItem, ...acc];
        } else if (dataItem.date > acc[acc.length - 1].date) {
          // data in array, date in the future, add element to the end
          acc = [...acc, portfolioItem];
        } else {
          // not yet in array, but date somewhere middle, find first larger date
          const appendIndex = acc.findIndex((d) => dataItem.date < d.date);
          acc.splice(appendIndex, 0, portfolioItem);
        }
      });

      return acc;
    }, [] as PortfolioGrowth[]);
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
    const reversedData = [...growthData].reverse();
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
    };

    console.log('daily result', result);
    return result;
  }

  /**
   *
   * @param transactions
   * @returns array of aggregated transaction by date
   */
  getPortfolioTransactionToDate(transactions: PortfolioTransaction[]): PortfolioTransactionToDate[] {
    return transactions.reduce((acc, curr) => {
      const existingTransaction = acc.find((d) => d.date === curr.date);
      if (!existingTransaction) {
        return [
          ...acc,
          {
            date: curr.date,
            numberOfExecutedBuyTransactions: curr.transactionType === 'BUY' ? 1 : 0,
            numberOfExecutedSellTransactions: curr.transactionType === 'SELL' ? 1 : 0,
            transactionFees: curr.transactionFees,
          },
        ];
      }

      existingTransaction.numberOfExecutedBuyTransactions += curr.transactionType === 'BUY' ? 1 : 0;
      existingTransaction.numberOfExecutedSellTransactions += curr.transactionType === 'SELL' ? 1 : 0;
      existingTransaction.transactionFees += curr.transactionFees;

      return acc;
    }, [] as PortfolioTransactionToDate[]);
  }

  /**
   * generate pie chart based on holdings representing sector allocation
   *
   * @param holdings
   * @returns
   */
  getPortfolioSectorAllocationPieChart(holdings: PortfolioStateHolding[]): GenericChartSeries<'pie'> {
    const allocations = this.getPortfolioSectorAllocation(holdings, 'sector');
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
    const sortedHoldings = [...holdings].sort(
      (a, b) => b.symbolSummary.quote.price * b.units - a.symbolSummary.quote.price * a.units,
    );
    const firstNData = sortedHoldings.slice(0, dataLimit);
    const restData = sortedHoldings.slice(dataLimit);

    // divide symbols into sectors
    const sectorsDivider = firstNData.reduce(
      (acc, curr) => {
        const sector = curr.symbolSummary.profile?.sector ?? curr.symbolType;
        return {
          ...acc,
          [sector]: [
            ...(acc[sector] ?? []),
            {
              name: curr.symbol,
              value: curr.symbolSummary.quote.price * curr.units,
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
        value: d.symbolSummary.quote.price * d.units,
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
    const allocations = this.getPortfolioSectorAllocation(holdings, 'asset');
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
   * generate array of sector\asset allocations, where name is the sector's/asset's name
   * and value is the value allocated to that  sector\asset
   *
   * @param holdings
   * @returns
   */
  private getPortfolioSectorAllocation(
    transactions: PortfolioStateHolding[],
    key: 'asset' | 'sector',
  ): { [name: string]: number } {
    if (transactions.length === 0) {
      return {};
    }

    return transactions.reduce(
      (acc, curr) => {
        const dataKey = key === 'asset' ? curr.symbol : curr.symbolSummary.profile?.sector ?? curr.symbolType;
        const existingData = acc[dataKey];
        if (existingData) {
          acc[dataKey] += curr.symbolSummary.quote.price * curr.units;
        } else {
          acc[dataKey] = curr.symbolSummary.quote.price * curr.units;
        }
        return acc;
      },
      {} as { [name: string]: number },
    );
  }
}
