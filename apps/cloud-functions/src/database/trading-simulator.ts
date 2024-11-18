import {
  TradingSimulator,
  TradingSimulatorParticipant,
  TradingSimulatorSymbol,
  TradingSimulatorTransactionAggregation,
} from '@mm/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './assign-type';

const tradingSimulatorCollectionRef = () =>
  firestore().collection('trading_simulator').withConverter(assignTypes<TradingSimulator>());

export const tradingSimulatorDocRef = (id: string) => tradingSimulatorCollectionRef().doc(id);

export const tradingSimulatorParticipantsCollectionRef = (id: string) =>
  tradingSimulatorDocRef(id).collection('participants').withConverter(assignTypes<TradingSimulatorParticipant>());

export const tradingSimulatorParticipantsDocRef = (id: string, participantId: string) =>
  tradingSimulatorParticipantsCollectionRef(id).doc(participantId);

export const tradingSimulatorSymbolsCollectionRef = (id: string) =>
  tradingSimulatorDocRef(id).collection('symbols').withConverter(assignTypes<TradingSimulatorSymbol>());

export const tradingSimulatorSymbolDocRef = (id: string, symbol: string) =>
  tradingSimulatorSymbolsCollectionRef(id).doc(symbol);

export const tradingSimulatorTransactionsCollectionRef = (id: string) =>
  tradingSimulatorDocRef(id)
    .collection('transactions')
    .withConverter(assignTypes<TradingSimulatorTransactionAggregation>());
