import { GroupBase } from './group.model';
import { UserBase } from './user.model';

export type HallOfFameUsers = {
  date: string;
  bestPortfolio: UserBase[];
  worstPortfolio: UserBase[];
  bestDailyGains: UserBase[];
  worstDailyGains: UserBase[];
};

export type HallOfFameGroups = {
  date: string;
  bestPortfolio: GroupBase[];
  worstPortfolio: GroupBase[];
  bestDailyGains: GroupBase[];
  worstDailyGains: GroupBase[];
};
