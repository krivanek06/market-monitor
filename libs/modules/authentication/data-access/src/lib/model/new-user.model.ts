import { UserData, UserPersonalInfo } from '@market-monitor/api-types';
export const createNewUser = (id: string, personal: UserPersonalInfo): UserData => {
  const newUser: UserData = {
    id,
    favoriteSymbols: [],
    lastSearchedSymbols: [],
    groups: {
      groupInvitations: [],
      groupMember: [],
      groupOwner: [],
      groupWatched: [],
    },
    settings: {
      isCreatingGroupAllowed: true,
      isPortfolioCashActive: true,
      isProfilePublic: true,
      isTransactionFeesActive: true,
    },
    personal: personal,
  };
  return newUser;
};
