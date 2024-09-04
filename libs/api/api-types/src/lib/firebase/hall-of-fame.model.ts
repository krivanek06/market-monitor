import { GroupBase } from './group.model';
import { RankingItem } from './ranking.model';
import { UserBase } from './user.model';

export type HallOfFameTopRankData<T> = { item: T; portfolioTotalGainsPercentage?: RankingItem };

export type HallOfFameUsers = {
  date: string;
  bestPortfolio: HallOfFameTopRankData<UserBase>[];
  bestDailyGains: UserBase[];
  worstDailyGains: UserBase[];
};

export type HallOfFameGroups = {
  date: string;
  bestPortfolio: HallOfFameTopRankData<GroupBase>[];
  bestDailyGains: GroupBase[];
  worstDailyGains: GroupBase[];
};
