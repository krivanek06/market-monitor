import { UserBase } from './user.model';

export type HallOfFameUsers = {
  date: string;
  bestPortfolio: UserBase[];
  worstPortfolio: UserBase[];
  bestDailyGains: UserBase[];
  worstDailyGains: UserBase[];
};
