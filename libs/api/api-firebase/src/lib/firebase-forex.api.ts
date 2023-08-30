import { firestore } from 'firebase-admin';

export const getDatabaseForexRef = (symbol: string) => firestore().collection('market_data_forex').doc(symbol);
export const getDatabaseForexMoreInformationRef = (symbol: string) =>
  getDatabaseForexRef(symbol).collection('more_information');
