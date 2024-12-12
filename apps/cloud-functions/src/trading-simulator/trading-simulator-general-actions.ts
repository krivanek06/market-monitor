import {
  DATA_NOT_FOUND_ERROR,
  FieldValueAll,
  FieldValuePartial,
  SIMULATOR_NOT_ENOUGH_UNITS_TO_SELL,
  SIMULATOR_PARTICIPANT_DIFFERENT_USER,
  SIMULATOR_PARTICIPANT_NOT_FOUND,
  SYMBOL_NOT_FOUND_ERROR,
  TRADING_SIMULATOR_PARTICIPANTS_LIMIT,
  TradingSimulator,
  TradingSimulatorAggregationParticipants,
  TradingSimulatorAggregationParticipantsData,
  TradingSimulatorAggregationSymbolsData,
  TradingSimulatorGeneralActions,
  TradingSimulatorGeneralActionsType,
  TradingSimulatorParticipant,
  USER_NOT_FOUND_ERROR,
  UserBaseMin,
} from '@mm/api-types';
import {
  checkTransactionOperationDataValidity,
  createEmptyPortfolioState,
  createTransactionMoreInfo,
  getPortfolioStateByNewTransactionUtil,
  getPortfolioStateHoldingBaseByTransactionsUtil,
  roundNDigits,
  transformUserToBaseMin,
} from '@mm/shared/general-util';
import { firestore } from 'firebase-admin';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/https';
import {
  tradingSimulatorAggregationParticipantsDocRef,
  tradingSimulatorAggregationSymbolsDocRef,
  tradingSimulatorDocRef,
  tradingSimulatorParticipantsCollectionRef,
  tradingSimulatorTransactionsRef,
  userDocumentRef,
} from '../database';
import { tradingSimulatorOnNextRound } from './trading-simulator-next-round';

export const tradingSimulatorGeneralActions = async (
  userAuthId: string | undefined,
  data: TradingSimulatorGeneralActions,
) => {
  if (!userAuthId) {
    return;
  }

  // user who is performing the action
  const authUser = (await userDocumentRef(userAuthId).get()).data();
  const simulator = (await tradingSimulatorDocRef(data.simulatorId).get()).data();

  if (!authUser) {
    throw new HttpsError('not-found', USER_NOT_FOUND_ERROR);
  }

  if (!simulator) {
    throw new HttpsError('not-found', DATA_NOT_FOUND_ERROR);
  }

  const authUserData = transformUserToBaseMin(authUser);

  if (data.type === 'participantJoinSimulator') {
    return joinSimulator(authUserData, simulator, data);
  }

  if (data.type === 'participantLeaveSimulator') {
    return leaveSimulator(authUserData, simulator, data);
  }

  if (data.type === 'nextRound') {
    return tradingSimulatorOnNextRoundManual(authUserData, simulator);
  }

  if (data.type === 'createOutstandingOrder') {
    return createOutstandingOrder(authUserData, simulator, data);
  }
};

const joinSimulator = async (
  user: UserBaseMin,
  simulator: TradingSimulator,
  data: TradingSimulatorGeneralActionsType<'participantJoinSimulator'>,
) => {
  // check if user is already a participant
  if (simulator.participants.includes(user.id)) {
    throw new HttpsError('already-exists', 'User is already a participant');
  }

  // check if there is space to join
  if (simulator.currentParticipants >= TRADING_SIMULATOR_PARTICIPANTS_LIMIT) {
    throw new HttpsError('failed-precondition', 'Simulator is full');
  }

  // check if provided invitation code is correct
  if (simulator.invitationCode !== data.invitationCode) {
    throw new HttpsError('permission-denied', 'Invalid invitation code');
  }

  // get firestore instance
  const db = firestore();

  return db.runTransaction(async (firebaseTransaction) => {
    // update simulator data
    firebaseTransaction.update(tradingSimulatorDocRef(simulator.id), {
      participants: FieldValue.arrayUnion(user.id),
      currentParticipants: FieldValue.increment(1),
    } satisfies FieldValuePartial<TradingSimulator>);

    // add user to participants
    firebaseTransaction.set(tradingSimulatorParticipantsCollectionRef(simulator.id).doc(user.id), {
      userData: user,
      portfolioState: createEmptyPortfolioState(simulator.cashStartingValue),
      transactions: [],
      portfolioGrowth: [],
      rank: {
        rank: 0,
        rankPrevious: 0,
        rankChange: null,
        date: '0',
      },
    });

    // add user to the participants ranking doc
    firebaseTransaction.update(tradingSimulatorAggregationParticipantsDocRef(simulator.id), {
      userRanking: FieldValue.arrayUnion({
        userData: user,
        rank: {
          date: '0',
          rank: 0,
          rankPrevious: 0,
          rankChange: null,
        },
        portfolioState: createEmptyPortfolioState(simulator.cashStartingValue),
      } satisfies TradingSimulatorAggregationParticipantsData),
    } satisfies FieldValuePartial<TradingSimulatorAggregationParticipants>);
  });
};

const leaveSimulator = async (
  user: UserBaseMin,
  simulator: TradingSimulator,
  data: TradingSimulatorGeneralActionsType<'participantLeaveSimulator'>,
) => {
  // check if user is a participant
  if (!simulator.participants.includes(user.id)) {
    throw new HttpsError('not-found', 'User is not a participant');
  }
  // get firestore instance
  const db = firestore();

  return db.runTransaction(async (firebaseTransaction) => {
    const participantsRanking =
      (await firebaseTransaction.get(tradingSimulatorAggregationParticipantsDocRef(simulator.id))).data()
        ?.userRanking ?? [];

    // update simulator data
    firebaseTransaction.update(tradingSimulatorDocRef(simulator.id), {
      participants: FieldValue.arrayRemove(user.id),
      currentParticipants: FieldValue.increment(-1),
    } satisfies FieldValuePartial<TradingSimulator>);

    // remove user from participants
    firebaseTransaction.delete(tradingSimulatorParticipantsCollectionRef(simulator.id).doc(user.id));

    // remove user from the participants ranking doc
    firebaseTransaction.update(tradingSimulatorAggregationParticipantsDocRef(simulator.id), {
      userRanking: participantsRanking.filter((participant) => participant.userData.id !== user.id),
    });
  });
};

const tradingSimulatorOnNextRoundManual = async (user: UserBaseMin, simulator: TradingSimulator) => {
  // check if user is the owner
  if (simulator.owner.id !== user.id) {
    throw new HttpsError('permission-denied', 'Only the owner can start the next round');
  }

  // check if simulator hasn't finished yet
  if (simulator.state === 'finished') {
    throw new HttpsError('failed-precondition', 'Simulator has already finished');
  }

  return tradingSimulatorOnNextRound(simulator);
};

const createOutstandingOrder = async (
  userData: UserBaseMin,
  simulator: TradingSimulator,
  data: TradingSimulatorGeneralActionsType<'createOutstandingOrder'>,
) => {
  // get firestore instance
  const db = firestore();

  return db.runTransaction(async (firebaseTransaction) => {
    const participantRef = tradingSimulatorParticipantsCollectionRef(simulator.id).doc(userData.id);
    const aggregationSymbolRef = tradingSimulatorAggregationSymbolsDocRef(simulator.id);

    // load necessary data
    const symbolAggregation = (await firebaseTransaction.get(aggregationSymbolRef)).data();
    const participant = (await firebaseTransaction.get(participantRef)).data();

    const symbolData = symbolAggregation?.[data.order.symbol];

    if (!symbolData) {
      throw new HttpsError('not-found', SYMBOL_NOT_FOUND_ERROR);
    }

    if (!participant) {
      throw new HttpsError('not-found', SIMULATOR_PARTICIPANT_NOT_FOUND);
    }

    // check if the user who creates the order is the same as the user in the order
    if (data.order.userData.id !== participant.userData.id) {
      throw new HttpsError('aborted', SIMULATOR_PARTICIPANT_DIFFERENT_USER);
    }

    const participantHoldings = getPortfolioStateHoldingBaseByTransactionsUtil(participant.transactions);

    // check for some validation
    checkTransactionOperationDataValidity(participant.portfolioState, participantHoldings, data.order);

    // BUY order
    if (data.order.orderType.type === 'BUY') {
      // check if there is enough units to buy
      if (!symbolData.unitsInfinity && symbolData.unitsCurrentlyAvailable < data.order.units) {
        throw new HttpsError('aborted', SIMULATOR_NOT_ENOUGH_UNITS_TO_SELL);
      }
    }

    // transform to transaction
    const transaction = createTransactionMoreInfo(
      participant.userData,
      participantHoldings,
      data.order,
      symbolData.price,
    );
    transaction.date = String(simulator.currentRound);

    // recalculate portfolio state
    const updatedPortfolio = getPortfolioStateByNewTransactionUtil(participant.portfolioState, transaction);

    // calculate holdings again with the new transaction
    const updatedHoldingsInvested = getPortfolioStateHoldingBaseByTransactionsUtil([
      ...participant.transactions,
      transaction,
    ]).reduce((acc, curr) => acc + curr.invested, 0);

    // update invested value - incorrect number is calculated by getPortfolioStateByNewTransactionUtil
    updatedPortfolio.invested = updatedHoldingsInvested;

    // get additional cash issued on all previous rounds
    const additionalCashOnRound = simulator.cashAdditionalIssued
      .filter((d) => d.issuedOnRound <= simulator.currentRound)
      .reduce((acc, curr) => acc + curr.value, 0);

    // add transaction to the participant data
    firebaseTransaction.update(participantRef, {
      transactions: FieldValue.arrayUnion(transaction),
      portfolioState: {
        ...updatedPortfolio,
        balance: roundNDigits(updatedPortfolio.balance + additionalCashOnRound),
        cashOnHand: roundNDigits(updatedPortfolio.cashOnHand + additionalCashOnRound),
      },
    } satisfies FieldValuePartial<TradingSimulatorParticipant>);

    // add transaction to the transaction collection
    firebaseTransaction.set(tradingSimulatorTransactionsRef(simulator.id, transaction.transactionId), transaction);

    // update symbol data
    const isSell = transaction.transactionType === 'SELL';
    firebaseTransaction.update(aggregationSymbolRef, {
      [transaction.symbol]: {
        boughtUnits: symbolData.boughtUnits + (isSell ? 0 : transaction.units),
        soldUnits: symbolData.soldUnits + (isSell ? transaction.units : 0),
        buyOperations: symbolData.buyOperations + (isSell ? 0 : 1),
        sellOperations: symbolData.sellOperations + (isSell ? 1 : 0),
        soldTotal: roundNDigits(symbolData.soldTotal + (isSell ? transaction.units * transaction.unitPrice : 0)),
        investedTotal: roundNDigits(
          symbolData.investedTotal + (isSell ? 0 : transaction.units * transaction.unitPrice),
        ),
        // change only if not infinite units
        unitsCurrentlyAvailable: symbolData.unitsInfinity
          ? symbolData.unitsCurrentlyAvailable
          : symbolData.unitsCurrentlyAvailable + (isSell ? transaction.units : -transaction.units),

        // keep old value unchanged
        price: symbolData.price,
        pricePrevious: symbolData.pricePrevious,
        symbol: symbolData.symbol,
        unitsInfinity: symbolData.unitsInfinity,
        unitsTotalAvailable: symbolData.unitsTotalAvailable,
      } satisfies FieldValueAll<TradingSimulatorAggregationSymbolsData>,
    });
  });
};
