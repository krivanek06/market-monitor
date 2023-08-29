import { HistoricalPrice } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './firebase.util';
import { DataSnapshot, HistoricalPriceTypes } from './models';

export const getDatabaseCryptoRef = (symbol: string) => firestore().collection('market_data_crypto').doc(symbol);
export const getDatabaseCryptoMoreInformationRef = (symbol: string) =>
  getDatabaseCryptoRef(symbol).collection('more_information');

export const getDatabaseCryptoDetailsHistorical = (symbol: string, historical: HistoricalPriceTypes) =>
  getDatabaseCryptoMoreInformationRef(symbol)
    .doc(historical)
    .withConverter(assignTypes<DataSnapshot<HistoricalPrice[]>>());
