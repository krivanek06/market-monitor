import {
  DATA_NOT_FOUND_ERROR,
  FieldValuePartial,
  TRADING_SIMULATOR_PARTICIPANTS_LIMIT,
  TradingSimulator,
  TradingSimulatorGeneralActions,
  TradingSimulatorGeneralActionsType,
  USER_NOT_FOUND_ERROR,
  UserBaseMin,
} from '@mm/api-types';
import { createEmptyPortfolioState, transformUserToBaseMin } from '@mm/shared/general-util';
import { FieldValue } from 'firebase-admin/firestore';
import { HttpsError } from 'firebase-functions/https';
import { tradingSimulatorDocRef, tradingSimulatorParticipantsCollectionRef, userDocumentRef } from '../database';

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

  // update simulator data
  tradingSimulatorDocRef(simulator.id).update({
    participants: FieldValue.arrayUnion(user.id),
    currentParticipants: FieldValue.increment(1),
  } satisfies FieldValuePartial<TradingSimulator>);

  // add user to participants
  tradingSimulatorParticipantsCollectionRef(simulator.id)
    .doc(user.id)
    .set({
      userData: user,
      portfolioState: createEmptyPortfolioState(simulator.cashStartingValue),
      holdings: [],
      transactions: [],
      portfolioGrowth: [],
    });
};

const leaveSimulator = async (
  user: UserBaseMin,
  simulator: TradingSimulator,
  data: TradingSimulatorGeneralActionsType<'participantLeaveSimulator'>,
) => {
  // check if user is a participant
  if (!simulator.participants.includes(user.id)) {
    return;
  }

  // update simulator data
  tradingSimulatorDocRef(simulator.id).update({
    participants: FieldValue.arrayRemove(user.id),
    currentParticipants: FieldValue.increment(-1),
  } satisfies FieldValuePartial<TradingSimulator>);

  // remove user from participants
  tradingSimulatorParticipantsCollectionRef(simulator.id).doc(user.id).delete();
};
