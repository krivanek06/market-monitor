import { Injectable } from '@angular/core';
import { MarketOverview, MarketOverviewData } from '@market-monitor/api-types';
import { GenericChartSeries } from '@market-monitor/shared-components';
import { zip } from 'lodash';
import { MarketOverviewChartData } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MarketDataTransformService {
  constructor() {}

  getMarketOverviewChartData(marketOverview: MarketOverview): MarketOverviewChartData {
    // helper method to construct parts of MarketOverviewChartData
    const helper = <T extends keyof MarketOverview>(
      mainKey: T,
      subKey: keyof MarketOverview[T]
    ): {
      marketOverview: MarketOverviewData;
      chartData: GenericChartSeries;
    } => {
      const overviewData = marketOverview[mainKey][subKey] as MarketOverviewData;
      return {
        marketOverview: overviewData,
        chartData: {
          data: zip(overviewData.dates, overviewData.data)
            .filter((values): values is [string, number] => !!values[0] && !!values[1])
            .reduce((acc, [date, value]) => [...acc, [date, value]], [] as [string, number][]),
        },
      };
    };

    const result: MarketOverviewChartData = {
      sp500: {
        peRatio: helper('sp500', 'peRatio'),
        shillerPeRatio: helper('sp500', 'shillerPeRatio'),
        dividendYield: helper('sp500', 'dividendYield'),
        earningsYield: helper('sp500', 'earningsYield'),
        priceToBook: helper('sp500', 'priceToBook'),
        priceToSales: helper('sp500', 'priceToSales'),
      },
      bonds: {
        usAAAYield: helper('bonds', 'usAAAYield'),
        usAAYield: helper('bonds', 'usAAYield'),
        usBBYield: helper('bonds', 'usBBYield'),
        usCCCYield: helper('bonds', 'usCCCYield'),
        usCorporateYield: helper('bonds', 'usCorporateYield'),
        usEmergingMarket: helper('bonds', 'usEmergingMarket'),
        usHighYield: helper('bonds', 'usHighYield'),
      },
      consumerIndex: {
        euCpi: helper('consumerIndex', 'euCpi'),
        gerCpi: helper('consumerIndex', 'gerCpi'),
        ukCpi: helper('consumerIndex', 'ukCpi'),
        usCpi: helper('consumerIndex', 'usCpi'),
      },
      inflationRate: {
        euInflationRate: helper('inflationRate', 'euInflationRate'),
        gerInflationRate: helper('inflationRate', 'gerInflationRate'),
        ukInflationRate: helper('inflationRate', 'ukInflationRate'),
        usInflationRate: helper('inflationRate', 'usInflationRate'),
      },
      treasury: {
        us10Year: helper('treasury', 'us10Year'),
        us1Month: helper('treasury', 'us1Month'),
        us1Year: helper('treasury', 'us1Year'),
        us30Year: helper('treasury', 'us30Year'),
        us3Month: helper('treasury', 'us3Month'),
        us5Year: helper('treasury', 'us5Year'),
      },
    };

    return result;
  }
}
