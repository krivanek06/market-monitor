import { TradingSimulatorGeneralActions } from '@mm/api-types';

export const tradingSimulatorGeneralActions = async (
  userAuthId: string | undefined,
  data: TradingSimulatorGeneralActions,
) => {
  if (!userAuthId) {
    return;
  }

  if (data.type === 'joinSimulator') {
    return joinSimulator(userAuthId, data);
  }

  if (data.type === 'leaveSimulator') {
    return leaveSimulator(userAuthId, data);
  }
};

const joinSimulator = async (userAuthId: string, data: any) => {};

const leaveSimulator = async (userAuthId: string, data: any) => {};
