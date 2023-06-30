import { Injectable } from '@angular/core';
import { MarketOverview, MarketOverviewData } from '@market-monitor/api-types';
import { zip } from 'lodash';
import { MarketOverviewChartData, MarketOverviewChartDataBody } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MarketDataTransformService {
  constructor() {}

  getMarketOverviewChartData(marketOverview: MarketOverview): MarketOverviewChartData {
    // helper method to construct parts of MarketOverviewChartData
    const helper = <T extends keyof MarketOverview>(
      mainKey: T,
      subKey: keyof MarketOverview[T],
      name: string
    ): MarketOverviewChartDataBody => {
      const overviewData = marketOverview[mainKey][subKey] as MarketOverviewData;
      return {
        marketOverview: overviewData,
        name: name,
        chartData: {
          name: name,
          additionalData: {
            showCurrencySign: false,
          },
          data: zip(overviewData.dates, overviewData.data)
            .filter((values): values is [string, number] => !!values[0] && !!values[1])
            .reduce((acc, [date, value]) => [...acc, [new Date(date).getTime(), value]], [] as [number, number][]),
        },
      };
    };

    const result: MarketOverviewChartData = {
      sp500: {
        peRatio: helper('sp500', 'peRatio', 'S&P 500 - PE ratio'),
        shillerPeRatio: helper('sp500', 'shillerPeRatio', 'S&P 500 - Shiller PE'),
        dividendYield: helper('sp500', 'dividendYield', 'S&P 500 - Dividend Yield'),
        earningsYield: helper('sp500', 'earningsYield', 'S&P 500 - Earnings Yield'),
        priceToBook: helper('sp500', 'priceToBook', 'S&P 500 - Price To Book'),
        priceToSales: helper('sp500', 'priceToSales', 'S&P 500 - Price To Sales'),
      },
      bonds: {
        usAAAYield: helper('bonds', 'usAAAYield', 'Bond - AAA yield'),
        usAAYield: helper('bonds', 'usAAYield', 'Bond - AA yield'),
        usBBYield: helper('bonds', 'usBBYield', 'Bond - BB yield'),
        usCCCYield: helper('bonds', 'usCCCYield', 'Bond - CCC yield'),
        usCorporateYield: helper('bonds', 'usCorporateYield', 'Bond - US Corporate yield'),
        usEmergingMarket: helper('bonds', 'usEmergingMarket', 'Bond - US Emerging Market yield'),
        usHighYield: helper('bonds', 'usHighYield', 'Bond - US Hight Yield'),
      },
      consumerIndex: {
        euCpi: helper('consumerIndex', 'euCpi', 'CPI - EU'),
        gerCpi: helper('consumerIndex', 'gerCpi', 'CPI - GER'),
        ukCpi: helper('consumerIndex', 'ukCpi', 'CPI - UK'),
        usCpi: helper('consumerIndex', 'usCpi', 'CPI - US'),
      },
      inflationRate: {
        euInflationRate: helper('inflationRate', 'euInflationRate', 'Inflation - EU'),
        gerInflationRate: helper('inflationRate', 'gerInflationRate', 'Inflation - GER'),
        ukInflationRate: helper('inflationRate', 'ukInflationRate', 'Inflation - UK'),
        usInflationRate: helper('inflationRate', 'usInflationRate', 'Inflation - US'),
      },
      treasury: {
        us1Month: helper('treasury', 'us1Month', 'Treasury - 1m'),
        us3Month: helper('treasury', 'us3Month', 'Treasury - 3m'),
        us1Year: helper('treasury', 'us1Year', 'Treasury - 1y'),
        us5Year: helper('treasury', 'us5Year', 'Treasury - 5y'),
        us10Year: helper('treasury', 'us10Year', 'Treasury - 10y'),
        us30Year: helper('treasury', 'us30Year', 'Treasury - 30y'),
      },
    };

    return result;
  }
}
