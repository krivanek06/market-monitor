import { News } from '@market-monitor/api-types';

export type UserCommonCachesData = {
  news: News[];
};

export type UserUnauthenticated = {
  lastSearchedStocks: string[];
  favoriteStocks: string[];
};
