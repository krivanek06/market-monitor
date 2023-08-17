import { Injectable } from '@angular/core';
import {
  MARKET_OVERVIEW_DATABASE_KEYS,
  MarketOverview,
  MarketOverviewData,
  getMarketOverKeyBySubKey,
} from '@market-monitor/api-types';
import { zip } from 'lodash';
import { MarketOverviewChartData, MarketOverviewChartDataBody } from '../models';

@Injectable({
  providedIn: 'root',
})
export class MarketDataTransformService {
  constructor() {}

  transformMarketOverviewData(
    name: string,
    overviewData: MarketOverviewData,
    subKey: string,
  ): MarketOverviewChartDataBody {
    return {
      marketOverview: overviewData,
      name: name,
      subKey: subKey,
      chartData: {
        name: name,
        additionalData: {
          showCurrencySign: false,
        },
        //color: color,
        data: zip(overviewData.dates, overviewData.data)
          .filter((values): values is [string, number] => !!values[0] && !!values[1])
          // changing the order of the data to be ascending
          .reduce((acc, [date, value]) => [[new Date(date).getTime(), value], ...acc], [] as [number, number][]),
      },
    };
  }

  transformMarketOverview(marketOverview: MarketOverview): MarketOverviewChartData {
    // helper method to construct parts of MarketOverviewChartData
    const helper = <T extends keyof MarketOverview>(
      mainKey: T,
      subKey: keyof MarketOverview[T],
    ): MarketOverviewChartDataBody => {
      const data = getMarketOverKeyBySubKey(String(subKey));
      const name = data ? data.name : 'Unresolved Name';
      const overviewData = marketOverview[mainKey][subKey] as MarketOverviewData;
      return this.transformMarketOverviewData(name, overviewData, String(subKey));
    };

    const result: MarketOverviewChartData = {
      sp500: {
        peRatio: helper('sp500', MARKET_OVERVIEW_DATABASE_KEYS.sp500.peRatio),
        shillerPeRatio: helper('sp500', MARKET_OVERVIEW_DATABASE_KEYS.sp500.shillerPeRatio),
        dividendYield: helper('sp500', MARKET_OVERVIEW_DATABASE_KEYS.sp500.dividendYield),
        earningsYield: helper('sp500', MARKET_OVERVIEW_DATABASE_KEYS.sp500.earningsYield),
        priceToBook: helper('sp500', MARKET_OVERVIEW_DATABASE_KEYS.sp500.priceToBook),
        priceToSales: helper('sp500', MARKET_OVERVIEW_DATABASE_KEYS.sp500.priceToSales),
      },
      bonds: {
        usAAAYield: helper('bonds', MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAAAYield),
        usAAYield: helper('bonds', MARKET_OVERVIEW_DATABASE_KEYS.bonds.usAAYield),
        usBBYield: helper('bonds', MARKET_OVERVIEW_DATABASE_KEYS.bonds.usBBYield),
        usCCCYield: helper('bonds', MARKET_OVERVIEW_DATABASE_KEYS.bonds.usCCCYield),
        usCorporateYield: helper('bonds', MARKET_OVERVIEW_DATABASE_KEYS.bonds.usCorporateYield),
        usEmergingMarket: helper('bonds', MARKET_OVERVIEW_DATABASE_KEYS.bonds.usEmergingMarket),
        usHighYield: helper('bonds', MARKET_OVERVIEW_DATABASE_KEYS.bonds.usHighYield),
      },
      consumerIndex: {
        euCpi: helper('consumerIndex', MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.euCpi),
        gerCpi: helper('consumerIndex', MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.gerCpi),
        ukCpi: helper('consumerIndex', MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.ukCpi),
        usCpi: helper('consumerIndex', MARKET_OVERVIEW_DATABASE_KEYS.consumerIndex.usCpi),
      },
      inflationRate: {
        euInflationRate: helper('inflationRate', MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.euInflationRate),
        gerInflationRate: helper('inflationRate', MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.gerInflationRate),
        ukInflationRate: helper('inflationRate', MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.ukInflationRate),
        usInflationRate: helper('inflationRate', MARKET_OVERVIEW_DATABASE_KEYS.inflationRate.usInflationRate),
      },
      treasury: {
        us1Month: helper('treasury', MARKET_OVERVIEW_DATABASE_KEYS.treasury.us1Month),
        us3Month: helper('treasury', MARKET_OVERVIEW_DATABASE_KEYS.treasury.us3Month),
        us1Year: helper('treasury', MARKET_OVERVIEW_DATABASE_KEYS.treasury.us1Year),
        us5Year: helper('treasury', MARKET_OVERVIEW_DATABASE_KEYS.treasury.us5Year),
        us10Year: helper('treasury', MARKET_OVERVIEW_DATABASE_KEYS.treasury.us10Year),
        us30Year: helper('treasury', MARKET_OVERVIEW_DATABASE_KEYS.treasury.us30Year),
      },
    };

    return result;
  }
}
