import { USER_ROLE, UserData, UserPersonalInfo } from '@market-monitor/api-types';
export const createNewUser = (id: string, personal: UserPersonalInfo): UserData => {
  const newUser: UserData = {
    id,
    groups: {
      groupInvitations: [],
      groupMember: [],
      groupOwner: [],
      groupWatched: [],
    },
    role: USER_ROLE.BASIC,
    settings: {
      isProfilePublic: true,
    },
    personal: personal,
    accountResets: [],
  };
  return newUser;
};
