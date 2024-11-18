import { TradingSimulatorGeneralActions, TradingSimulatorGeneralActionsByType, USER_HAS_DEMO_ACCOUNT_ERROR, USER_INCORRECT_ACCOUNT_TYPE_ERROR, USER_NOT_FOUND_ERROR, UserAccountEnum } from '@mm/api-types';
import { userDocumentRef } from '../database';
import { HttpsError } from 'firebase-functions/https';

export const tradingSimulatorGeneralActions = async (
  userAuthId: string | undefined,
  data: TradingSimulatorGeneralActions,
) => {
  if (!userAuthId) {
    return;
  }

  const authUserData = (await userDocumentRef(userAuthId).get()).data();
  const tradingSimulator =


  // check if auth user exists
  if (!authUserData) {
    throw new HttpsError('not-found', USER_NOT_FOUND_ERROR);
  }

  // demo account can not be added to the group
  if (authUserData.isDemo) {
    throw new HttpsError('aborted', USER_HAS_DEMO_ACCOUNT_ERROR);
  }

  if (data.type === 'joinSimulator') {
    return joinSimulator(userAuthId, data);
  }

  if (data.type === 'leaveSimulator') {
    return leaveSimulator(userAuthId, data);
  }
};

const joinSimulator = async (userAuthId: string, data: TradingSimulatorGeneralActionsByType<'joinSimulator'>) => {};

const leaveSimulator = async (userAuthId: string, data: any) => {};
