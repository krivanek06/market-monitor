import { Injectable } from '@angular/core';
import { StockSummary } from '@market-monitor/api-types';
import { GenericChartSeriesPie } from '@market-monitor/shared/data-access';
import { PortfolioChange, PortfolioState } from '../models';

@Injectable({
  providedIn: 'root',
})
export class PortfolioCalculationService {
  constructor() {}

  calculatePortfolioState(holdings: StockSummary[]): PortfolioState | null {
    return null;
  }

  calculatePortfolioChange(holdings: StockSummary[]): PortfolioChange | null {
    return null;
  }

  /**
   *
   * @param holdings
   * @returns - array of sector allocations, where name is the sector's name and value is the value allocated to that sector
   */
  calculatePortfolioSectorAllocation(holdings: StockSummary[]): { [name: string]: number }[] {
    return [];
  }

  /**
   *
   * @param holdings
   * @returns - data to generate pie chart based on provided holdings, where only the first N holdings name are used
   *           and the rest are grouped into "Other" category
   */
  calculatePortfolioAssetAllocation(holdings: StockSummary[]): GenericChartSeriesPie | null {
    return null;
  }
}
