import { Injectable } from '@angular/core';
import { PortfolioGrowthAssets, PortfolioTransaction, SymbolSummary } from '@market-monitor/api-types';
import { GenericChartSeriesData, GenericChartSeriesPie } from '@market-monitor/shared/data-access';
import { PortfolioChange, PortfolioGrowth, PortfolioStateHolding, PortfolioStateHoldingPartial } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PortfolioCalculationService {
  constructor() {}

  getPortfolioGrowth(data: PortfolioGrowthAssets[]): PortfolioGrowth[] {
    return data.reduce((acc, curr) => {
      curr.data.forEach((dataItem) => {
        // find index of element with same date
        const elementIndex = acc.findIndex((el) => el.date === dataItem.date);

        // if elementIndex exists, add value to it
        if (elementIndex > -1) {
          acc[elementIndex].investedValue += dataItem.investedValue;
          acc[elementIndex].ownedAssets += dataItem.units > 0 ? 1 : 0;
          return;
        }

        const portfolioItem: PortfolioGrowth = {
          date: dataItem.date,
          investedValue: dataItem.investedValue,
          ownedAssets: 1,
          marketTotalValue: dataItem.marketTotalValue,
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

  getPortfolioChange(holdings: SymbolSummary[]): PortfolioChange | null {
    return null;
  }

  /**
   * generate array of sector allocations, where name is the sector's name
   * and value is the value allocated to that sector
   *
   * @param holdings
   * @returns
   */
  getPortfolioSectorAllocation(
    transactions: PortfolioStateHolding[],
    key: 'asset' | 'sector',
  ): { [name: string]: number } {
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
  getPortfolioAssetAllocation(holdings: PortfolioStateHolding[]): GenericChartSeriesPie {
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
      data: resultData,
    };
  }
}
