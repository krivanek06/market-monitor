import { UserBase, UserData } from '@market-monitor/api-types';

export const transformUserToBase = (user: UserData): UserBase => {
  return {
    id: user.id,
    accountCreatedDate: user.accountCreatedDate,
    lastPortfolioState: user.lastPortfolioState,
    personal: user.personal,
  };
};
