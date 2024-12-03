import {
  PortfolioTransaction,
  TradingSimulator,
  TradingSimulatorAggregationParticipants,
  TradingSimulatorAggregationSymbols,
  TradingSimulatorAggregationTransactions,
  TradingSimulatorParticipant,
  TradingSimulatorSymbol,
} from '@mm/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './assign-type';

export const tradingSimulatorCollectionRef = () =>
  firestore().collection('trading_simulator').withConverter(assignTypes<TradingSimulator>());

const tradingSimulatorMoreInformationCollectionRef = (id: string) =>
  tradingSimulatorDocRef(id).collection('more_information');

export const tradingSimulatorDocRef = (id: string) => tradingSimulatorCollectionRef().doc(id);

export const tradingSimulatorParticipantsCollectionRef = (id: string) =>
  tradingSimulatorDocRef(id).collection('participants').withConverter(assignTypes<TradingSimulatorParticipant>());

export const tradingSimulatorParticipantsDocRef = (id: string, participantId: string) =>
  tradingSimulatorParticipantsCollectionRef(id).doc(participantId);

export const tradingSimulatorSymbolsCollectionRef = (id: string) =>
  tradingSimulatorDocRef(id).collection('symbols').withConverter(assignTypes<TradingSimulatorSymbol>());

export const tradingSimulatorTransactionsCollectionRef = (id: string) =>
  tradingSimulatorDocRef(id).collection('transactions').withConverter(assignTypes<PortfolioTransaction>());

export const tradingSimulatorTransactionsRef = (id: string, transactionId: string) =>
  tradingSimulatorTransactionsCollectionRef(id).doc(transactionId);

export const tradingSimulatorSymbolDocRef = (id: string, symbol: string) =>
  tradingSimulatorSymbolsCollectionRef(id).doc(symbol);

export const tradingSimulatorAggregationSymbolsDocRef = (id: string) =>
  tradingSimulatorMoreInformationCollectionRef(id)
    .doc('aggregation_symbols')
    .withConverter(assignTypes<TradingSimulatorAggregationSymbols>());

export const tradingSimulatorAggregationTransactionsDocRef = (id: string) =>
  tradingSimulatorMoreInformationCollectionRef(id)
    .doc('aggregation_transactions')
    .withConverter(assignTypes<TradingSimulatorAggregationTransactions>());

export const tradingSimulatorAggregationParticipantsDocRef = (id: string) =>
  tradingSimulatorMoreInformationCollectionRef(id)
    .doc('aggregation_participants')
    .withConverter(assignTypes<TradingSimulatorAggregationParticipants>());
