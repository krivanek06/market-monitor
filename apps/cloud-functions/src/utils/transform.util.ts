import { GroupMember, UserBase, UserData } from '@market-monitor/api-types';
import { getCurrentDateDefaultFormat } from '@market-monitor/shared/utils-general';

export const transformUserToBase = (user: UserData): UserBase => {
  return {
    id: user.id,
    accountCreatedDate: user.accountCreatedDate,
    lastPortfolioState: user.lastPortfolioState,
    personal: user.personal,
  };
};

export const transformUserToGroupMember = (user: UserData): GroupMember => {
  return {
    ...transformUserToBase(user),
    since: getCurrentDateDefaultFormat(),
  };
};
