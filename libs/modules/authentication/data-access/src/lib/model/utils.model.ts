import { UserAccountEnum, UserAccountTypes, UserData } from '@mm/api-types';

export const hasUserAccess = (userData: UserData | undefined | null, accountType: UserAccountTypes) => {
  if (!userData) {
    return false;
  }

  const userAccountType = userData?.userAccountType;
  const providedAccountType = UserAccountEnum[accountType];

  // if admin allow anything
  if (userAccountType === UserAccountEnum.ADMIN) {
    return true;
  }

  // check if paid user
  if (
    userAccountType === UserAccountEnum.NORMAL_PAID &&
    [UserAccountEnum.NORMAL_PAID, UserAccountEnum.NORMAL_BASIC].includes(providedAccountType)
  ) {
    return true;
  }

  // check if normal user
  if (userAccountType === UserAccountEnum.NORMAL_BASIC && providedAccountType === UserAccountEnum.NORMAL_BASIC) {
    return true;
  }

  // check if demo user
  if (userAccountType === UserAccountEnum.DEMO_TRADING && providedAccountType === UserAccountEnum.DEMO_TRADING) {
    return true;
  }

  return false;
};
