export type RankingItem = {
  rank: number;
  /**
   * previous rank, on first calculation it is null
   */
  rankPrevious: number | null;
  /**
   * difference between rank and rankPrevious, on first calculation it is null
   */
  rankChange?: number | null;
  /**
   * date when rank was calculated
   */
  date: string;
};
