import { getMostPerformingStocks, getSymbolPrice } from '@market-monitor/api-external';
import { getDatabaseMarketTopPerformanceRef } from '@market-monitor/api-firebase';
import { MarketTopPerformanceOverviewResponse, SYMBOL_SP500 } from '@market-monitor/api-types';
import { isBefore, subMinutes } from 'date-fns';
import { Response } from 'express';
import { onRequest } from 'firebase-functions/v2/https';
import { getSummaries } from '../../shared';

export const getmarkettopperformance = onRequest(
  async (_, response: Response<MarketTopPerformanceOverviewResponse>) => {
    // load data from firestore
    const marketTopPerformanceRef = getDatabaseMarketTopPerformanceRef();
    const marketOverviewData = (await marketTopPerformanceRef.get()).data();

    // data exists and not older than 3 min
    const shouldUseDataFromFirestore =
      marketOverviewData && !isBefore(new Date(marketOverviewData.lastUpdate), subMinutes(new Date(), 3));

    console.log('shouldUseDataFromFirestore', shouldUseDataFromFirestore);

    // determine whether to load data from API or used from DB
    const [gainers, losers, actives, sp500Change] = !shouldUseDataFromFirestore
      ? await Promise.all([
          getMostPerformingStocks('gainers'),
          getMostPerformingStocks('losers'),
          getMostPerformingStocks('actives'),
          getSymbolPrice(SYMBOL_SP500),
        ])
      : [
          marketOverviewData.stockTopGainers,
          marketOverviewData.stockTopLosers,
          marketOverviewData.stockTopActive,
          marketOverviewData.sp500Change,
        ];

    // save data into firestore
    if (!shouldUseDataFromFirestore) {
      console.log('saving data to firestore');
      await marketTopPerformanceRef.set({
        stockTopGainers: gainers,
        stockTopLosers: losers,
        stockTopActive: actives,
        sp500Change,
        lastUpdate: new Date().toISOString(),
      });
    }

    // get sp500 change - first element of the array
    const gainersSymbols = gainers.map((d) => d.symbol);
    const losersSymbols = losers.map((d) => d.symbol);
    const activesSymbols = actives.map((d) => d.symbol);

    // load stock summary data
    const [gainersData, losersData, activesData] = await Promise.all([
      getSummaries(gainersSymbols),
      getSummaries(losersSymbols),
      getSummaries(activesSymbols),
    ]);

    // limit data in fireabase
    const limit = 15;

    // filter out not ETFs, Funds and limit data
    const stockTopGainers = gainersData.filter((d) => !d.profile.isEtf && !d.profile.isFund).slice(0, limit);
    const stockTopLosers = losersData.filter((d) => !d.profile.isEtf && !d.profile.isFund).slice(0, limit);
    const stockTopActive = activesData.filter((d) => !d.profile.isEtf && !d.profile.isFund).slice(0, limit);

    // construct response
    const responseData: MarketTopPerformanceOverviewResponse = {
      sp500Change,
      lastUpdate: new Date().toISOString(),
      stockTopGainers,
      stockTopLosers,
      stockTopActive,
    };

    // send response
    response.status(200).send(responseData);
  }
);
