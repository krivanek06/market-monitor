import { HistoricalPrice } from '@market-monitor/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './firebase.util';
import { DataSnapshot, HistoricalPriceTypes } from './models';

export const getDatabaseForexRef = (symbol: string) => firestore().collection('market_data_forex').doc(symbol);
export const getDatabaseForexMoreInformationRef = (symbol: string) =>
  getDatabaseForexRef(symbol).collection('more_information');

export const getDatabaseForexDetailsHistorical = (symbol: string, historical: HistoricalPriceTypes) =>
  getDatabaseForexMoreInformationRef(symbol)
    .doc(historical)
    .withConverter(assignTypes<DataSnapshot<HistoricalPrice[]>>());
