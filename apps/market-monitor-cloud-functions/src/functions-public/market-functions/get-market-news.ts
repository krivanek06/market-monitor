import { getNewsCrypto, getNewsForex, getNewsGeneral, getNewsStock } from '@market-monitor/api-external';
import {
  DataSnapshot,
  getDatabaseCryptoDetailsNews,
  getDatabaseForexDetailsNews,
  getDatabaseMarketNewsRef,
  getDatabaseStockDetailsNews,
} from '@market-monitor/api-firebase';
import { FirebaseNewsTypes, News, firebaseNewsAcceptableTypes } from '@market-monitor/api-types';
import { subHours } from 'date-fns';
import { Request, Response } from 'express';

/**
 * Get market news, update data in firestore every 2h
 *
 * @param request
 * - query.news_types: stocks | crypto | forex | general
 * - query.symbol: string
 * @param response
 */
export const getMarketNewsWrapper = async (request: Request, response: Response<News[]>) => {
  const newsTypes = request.query.news_types as FirebaseNewsTypes;
  const symbol = (request.query.symbol as string) ?? '';

  // if not news type, return empty array
  if (!newsTypes || !firebaseNewsAcceptableTypes.includes(newsTypes)) {
    response.send([]);
    return;
  }
  // get the reference to the correct path in firestore
  const marketNewsRef = resolveDatabaseNewsPath(newsTypes, symbol);
  const marketNewsData = (await marketNewsRef.get()).data();

  // check if data exists and not older than 2h
  const hoursMax = 2;
  if (marketNewsData && subHours(new Date(), hoursMax) < new Date(marketNewsData.lastUpdate)) {
    response.send(marketNewsData.data);
    return;
  }

  // general news are always present in database, so we don't have to wait for update
  // and we can return older data immediately
  const earlyReturn = newsTypes === 'general' && marketNewsData;

  if (earlyReturn) {
    response.send(marketNewsData.data);
  }

  // resolve what news have to be fetched based on newsTypes and symbol
  const news = await fetchNewsForType(newsTypes, symbol);

  // save data to firestore to correct path
  await marketNewsRef.set({
    data: news,
    lastUpdate: new Date().toISOString(),
  });

  // return data
  if (!earlyReturn) {
    response.send(news);
  }
};

const resolveDatabaseNewsPath = (
  newsType: FirebaseNewsTypes,
  symbol: string,
): FirebaseFirestore.DocumentReference<DataSnapshot<News[]>> => {
  // based on type and symbol, return correct path
  if (newsType === 'stocks' && symbol) {
    return getDatabaseStockDetailsNews(symbol);
  }
  if (newsType === 'crypto' && symbol) {
    return getDatabaseCryptoDetailsNews(symbol);
  }
  if (newsType === 'forex' && symbol) {
    return getDatabaseForexDetailsNews(symbol);
  }

  // if symbol is empty, return generic news for type
  return getDatabaseMarketNewsRef(newsType);
};

const fetchNewsForType = async (newsType: FirebaseNewsTypes, symbol: string): Promise<News[]> => {
  if (newsType === 'stocks') {
    return getNewsStock(symbol);
  }
  if (newsType === 'crypto') {
    return getNewsCrypto(symbol);
  }
  if (newsType === 'forex') {
    return getNewsForex(symbol);
  }
  return getNewsGeneral();
};
