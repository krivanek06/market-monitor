import { Injectable } from '@angular/core';
import { PortfolioGrowthAssets, SymbolSummary } from '@market-monitor/api-types';
import { GenericChartSeriesPie } from '@market-monitor/shared/data-access';
import { PortfolioChange, PortfolioGrowth, PortfolioState } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PortfolioCalculationService {
  constructor() {}

  calculatePortfolioGrowth(data: PortfolioGrowthAssets[]): PortfolioGrowth[] {
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

  calculatePortfolioState(holdings: SymbolSummary[]): PortfolioState | null {
    return null;
  }

  calculatePortfolioChange(holdings: SymbolSummary[]): PortfolioChange | null {
    return null;
  }

  /**
   *
   * @param holdings
   * @returns - array of sector allocations, where name is the sector's name and value is the value allocated to that sector
   */
  calculatePortfolioSectorAllocation(holdings: SymbolSummary[]): { [name: string]: number }[] {
    return [];
  }

  /**
   *
   * @param holdings
   * @returns - data to generate pie chart based on provided holdings, where only the first N holdings name are used
   *           and the rest are grouped into "Other" category
   */
  calculatePortfolioAssetAllocation(holdings: SymbolSummary[]): GenericChartSeriesPie | null {
    return null;
  }
}
