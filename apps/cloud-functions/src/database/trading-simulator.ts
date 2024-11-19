import {
  TradingSimulator,
  TradingSimulatorAggregations,
  TradingSimulatorParticipant,
  TradingSimulatorSymbol,
} from '@mm/api-types';
import { firestore } from 'firebase-admin';
import { assignTypes } from './assign-type';

const tradingSimulatorCollectionRef = () =>
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

export const tradingSimulatorSymbolDocRef = (id: string, symbol: string) =>
  tradingSimulatorSymbolsCollectionRef(id).doc(symbol);

export const tradingSimulatorAggregationDocRef = (id: string) =>
  tradingSimulatorMoreInformationCollectionRef(id)
    .doc('aggregations')
    .withConverter(assignTypes<TradingSimulatorAggregations>());
