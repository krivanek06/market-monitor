import { CompanyRating } from '@market-monitor/api-types';

export type CompanyRatingTable = CompanyRating & {
  ratingDetailsDCFScoreValue: number;
  ratingDetailsROEScoreValue: number;
  ratingDetailsROAScoreValue: number;
  ratingDetailsDEScoreValue: number;
  ratingDetailsPEScoreValue: number;
  ratingDetailsPBScoreValue: number;
};
