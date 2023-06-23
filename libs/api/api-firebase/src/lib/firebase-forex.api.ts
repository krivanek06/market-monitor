import { HistoricalPrice, News } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './firebase.util';
import { DataSnapshot, FirebaseForexDataFields, HistoricalPriceTypes } from './models';

export const getDatabaseForexDetailsHistorical = (symbol: string, historical: HistoricalPriceTypes) =>
  firestore()
    .collection(FirebaseForexDataFields.market_data_forex)
    .doc(symbol)
    .collection(FirebaseForexDataFields.more_information)
    .doc(historical)
    .withConverter(assignTypes<DataSnapshot<HistoricalPrice[]>>());

export const getDatabaseForexDetailsNews = (symbol: string) =>
  firestore()
    .collection(FirebaseForexDataFields.market_data_forex)
    .doc(symbol)
    .collection(FirebaseForexDataFields.more_information)
    .doc(FirebaseForexDataFields.forex_news)
    .withConverter(assignTypes<DataSnapshot<News[]>>());
