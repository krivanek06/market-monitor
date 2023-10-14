import { UserData, UserPersonalInfo } from '@market-monitor/api-types';
export const createNewUser = (id: string, personal: UserPersonalInfo): UserData => {
  const newUser: UserData = {
    id,
    groups: {
      groupInvitations: [],
      groupMember: [],
      groupOwner: [],
      groupWatched: [],
    },
    settings: {
      isProfilePublic: true,
      isHistoricalAssetsTradingAllowed: true,

      isCreatingGroupAllowed: false,
      isPortfolioCashActive: false,
    },
    personal: personal,
    accountResets: [],
  };
  return newUser;
};
