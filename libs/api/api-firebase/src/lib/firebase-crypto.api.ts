import { firestore } from 'firebase-admin';

export const getDatabaseCryptoRef = (symbol: string) => firestore().collection('market_data_crypto').doc(symbol);
export const getDatabaseCryptoMoreInformationRef = (symbol: string) =>
  getDatabaseCryptoRef(symbol).collection('more_information');
