import {
  DATA_NOT_FOUND_ERROR,
  TradingSimulator,
  TradingSimulatorGeneralActions,
  TradingSimulatorGeneralActionsByType,
  USER_HAS_DEMO_ACCOUNT_ERROR,
  USER_NOT_FOUND_ERROR,
  UserData,
} from '@mm/api-types';
import { HttpsError } from 'firebase-functions/https';
import { tradingSimulatorDocRef, userDocumentRef } from '../database';

export const tradingSimulatorGeneralActions = async (
  userAuthId: string | undefined,
  data: TradingSimulatorGeneralActions,
) => {
  if (!userAuthId) {
    return;
  }

  const authUserData = (await userDocumentRef(userAuthId).get()).data();
  const tradingSimulator = (await tradingSimulatorDocRef(data.simulatorId).get()).data();

  // check if auth user exists
  if (!authUserData) {
    throw new HttpsError('not-found', USER_NOT_FOUND_ERROR);
  }

  // check if trading simulator exists
  if (!tradingSimulator) {
    throw new HttpsError('not-found', DATA_NOT_FOUND_ERROR);
  }

  // demo account can not be added to the group
  if (authUserData.isDemo) {
    throw new HttpsError('aborted', USER_HAS_DEMO_ACCOUNT_ERROR);
  }

  if (data.type === 'joinSimulator') {
    return joinSimulator(authUserData, tradingSimulator, data);
  }

  if (data.type === 'leaveSimulator') {
    return leaveSimulator(authUserData, tradingSimulator);
  }
};

const joinSimulator = async (
  user: UserData,
  simulator: TradingSimulator,
  data: TradingSimulatorGeneralActionsByType<'joinSimulator'>,
) => {
  // check if user is already a participant
  if (simulator.participants.includes(user.id)) {
    return;
  }

  // check if provided invitation code is correct
  if (simulator.invitationCode !== data.invitationCode) {
    throw new HttpsError('permission-denied', 'Invalid invitation code');
  }

  // add user to the participants
  await tradingSimulatorDocRef(simulator.id).update({
    participants: [...simulator.participants, user.id],
  });
};

const leaveSimulator = async (user: UserData, simulator: TradingSimulator) => {
  // remove user from the participants
  await tradingSimulatorDocRef(simulator.id).update({
    participants: simulator.participants.filter((participant) => participant !== user.id),
  });
};
