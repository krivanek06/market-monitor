import { Injectable } from '@angular/core';
import { PortfolioGrowthAssets, PortfolioTransaction } from '@market-monitor/api-types';
import { GenericChartSeriesData, GenericChartSeriesPie, ValueItem } from '@market-monitor/shared/data-access';
import { dateFormatDate, roundNDigits } from '@market-monitor/shared/utils-general';
import { subDays, subMonths, subWeeks, subYears } from 'date-fns';
import {
  PortfolioChange,
  PortfolioGrowth,
  PortfolioStateHolding,
  PortfolioStateHoldingPartial,
  PortfolioTransactionToDate,
} from '../models';

@Injectable({
  providedIn: 'root',
})
export class PortfolioCalculationService {
  getPortfolioGrowth(data: PortfolioGrowthAssets[], startingCashValue = 0): PortfolioGrowth[] {
    return data.reduce((acc, curr) => {
      curr.data.forEach((dataItem) => {
        // find index of element with same date
        const elementIndex = acc.findIndex((el) => el.date === dataItem.date);

        // if elementIndex exists, add value to it => different symbol, same date
        if (elementIndex > -1) {
          acc[elementIndex].investedValue += dataItem.investedValue;
          acc[elementIndex].marketTotalValue += dataItem.marketTotalValue;
          acc[elementIndex].ownedAssets += dataItem.units > 0 ? 1 : 0;
          return;
        }

        // initial object
        const portfolioItem: PortfolioGrowth = {
          date: dataItem.date,
          investedValue: dataItem.investedValue,
          ownedAssets: 1,
          marketTotalValue: dataItem.marketTotalValue,
          totalBalanceValue: dataItem.marketTotalValue - dataItem.investedValue + startingCashValue,
        };

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
   * get partial data for user's current holdings from all previous transactions, where units are more than 0
   *
   * @param transactions - user's transactions
   * @returns
   */
  getPortfolioStateHoldingPartial(transactions: PortfolioTransaction[]): PortfolioStateHoldingPartial[] {
    return transactions
      .reduce((acc, curr) => {
        const existingHolding = acc.find((d) => d.symbol === curr.symbol);
        const isSell = curr.transactionType === 'SELL';
        // update existing holding
        if (existingHolding) {
          existingHolding.units += isSell ? -curr.units : curr.units;
          existingHolding.invested += curr.unitPrice * curr.units * (isSell ? -1 : 1);
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
            units: curr.units,
            invested: curr.unitPrice * curr.units,
          } satisfies PortfolioStateHoldingPartial,
        ];
      }, [] as PortfolioStateHoldingPartial[])
      .filter((d) => d.units > 0);
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
    // reverse data to start from DESC
    const reversedData = [...growthData].reverse();
    const today = new Date();
    const todayBalance = reversedData.at(0)?.marketTotalValue;

    // return default values if no data
    if (!todayBalance) {
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

    // construct dates
    const day1ChangeDate = dateFormatDate(subDays(today, 1));
    const week1ChangeDate = dateFormatDate(subWeeks(today, 1));
    const week2ChangeDate = dateFormatDate(subWeeks(today, 2));
    const week3ChangeDate = dateFormatDate(subWeeks(today, 3));
    const month1ChangeDate = dateFormatDate(subMonths(today, 1));
    const month3ChangeDate = dateFormatDate(subMonths(today, 3));
    const month6ChangeDate = dateFormatDate(subMonths(today, 6));
    const year1ChangeDate = dateFormatDate(subYears(today, 1));

    // find index for data which date's are one smaller than the date we are looking for
    const day1ChangeIndex = reversedData.findIndex((d) => d.date <= day1ChangeDate);
    const week1ChangeIndex = reversedData.findIndex((d) => d.date <= week1ChangeDate);
    const week2ChangeIndex = reversedData.findIndex((d) => d.date <= week2ChangeDate);
    const week3ChangeIndex = reversedData.findIndex((d) => d.date <= week3ChangeDate);
    const month1ChangeIndex = reversedData.findIndex((d) => d.date <= month1ChangeDate);
    const month3ChangeIndex = reversedData.findIndex((d) => d.date <= month3ChangeDate);
    const month6ChangeIndex = reversedData.findIndex((d) => d.date <= month6ChangeDate);
    const year1ChangeIndex = reversedData.findIndex((d) => d.date <= year1ChangeDate);

    // create helper function to create change value
    const createPortfolioChangeValue = (growth: PortfolioGrowth): ValueItem =>
      ({
        value: roundNDigits(todayBalance - growth.marketTotalValue, 2),
        valuePrct: roundNDigits((todayBalance - growth.marketTotalValue) / growth.marketTotalValue, 4),
      }) satisfies ValueItem;

    // calculate change for each time period
    const result: PortfolioChange = {
      '1_day': day1ChangeIndex > -1 ? createPortfolioChangeValue(reversedData[day1ChangeIndex]) : null,
      '1_week': week1ChangeIndex > -1 ? createPortfolioChangeValue(reversedData[week1ChangeIndex]) : null,
      '2_week': week2ChangeIndex > -1 ? createPortfolioChangeValue(reversedData[week2ChangeIndex]) : null,
      '3_week': week3ChangeIndex > -1 ? createPortfolioChangeValue(reversedData[week3ChangeIndex]) : null,
      '1_month': month1ChangeIndex > -1 ? createPortfolioChangeValue(reversedData[month1ChangeIndex]) : null,
      '3_month': month3ChangeIndex > -1 ? createPortfolioChangeValue(reversedData[month3ChangeIndex]) : null,
      '6_month': month6ChangeIndex > -1 ? createPortfolioChangeValue(reversedData[month6ChangeIndex]) : null,
      '1_year': year1ChangeIndex > -1 ? createPortfolioChangeValue(reversedData[year1ChangeIndex]) : null,
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
  getPortfolioSectorAllocationPieChart(holdings: PortfolioStateHolding[]): GenericChartSeriesPie {
    const allocations = this.getPortfolioSectorAllocation(holdings, 'sector');
    const chartData = Object.entries(allocations)
      .map(
        ([name, value]) =>
          ({
            y: Number(value),
            name,
          }) satisfies GenericChartSeriesData,
      )
      .sort((a, b) => b.y - a.y);

    return {
      name: 'Sector Allocation',
      type: 'pie',
      innerSize: '35%',
      data: chartData,
    };
  }

  /**
   * generate pie chart based on provided holdings, where only the first N holdings name are used
   * and the rest are grouped into "Other" category
   *
   * @param holdings
   * @returns
   */
  getPortfolioAssetAllocationPieChart(holdings: PortfolioStateHolding[]): GenericChartSeriesPie {
    const visibleData = 8;
    const allocations = this.getPortfolioSectorAllocation(holdings, 'asset');
    const chartData = Object.entries(allocations)
      .map(
        ([name, value]) =>
          ({
            y: Number(value),
            name,
          }) satisfies GenericChartSeriesData,
      )
      .sort((a, b) => b.y - a.y);

    // combine last elements into "Other" category
    const otherCategory = chartData.slice(visibleData).reduce(
      (acc, curr) => {
        acc.y += curr.y;
        return acc;
      },
      { name: 'Other', y: 0 } as GenericChartSeriesData,
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
