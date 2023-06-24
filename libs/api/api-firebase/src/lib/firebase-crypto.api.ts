import { HistoricalPrice, News } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './firebase.util';
import { DataSnapshot, FirebaseCryptDataFields, HistoricalPriceTypes } from './models';

export const getDatabaseCryptoDetailsHistorical = (symbol: string, historical: HistoricalPriceTypes) =>
  firestore()
    .collection(FirebaseCryptDataFields.market_data_crypto)
    .doc(symbol)
    .collection(FirebaseCryptDataFields.more_information)
    .doc(historical)
    .withConverter(assignTypes<DataSnapshot<HistoricalPrice[]>>());

export const getDatabaseCryptoDetailsNews = (symbol: string) =>
  firestore()
    .collection(FirebaseCryptDataFields.market_data_crypto)
    .doc(symbol)
    .collection(FirebaseCryptDataFields.more_information)
    .doc(FirebaseCryptDataFields.crypto_news)
    .withConverter(assignTypes<DataSnapshot<News[]>>());
