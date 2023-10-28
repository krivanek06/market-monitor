export const sectorData = [
  'Basic Materials',
  'Communication Services',
  'Consumer Cyclical',
  'Consumer Defensive',
  'Consumer Goods',
  'Energy',
  'Financial',
  'Financial Services',
  'Healthcare',
  'Industrials',
  'Real Estate',
  'Services',
  'Technology',
  'Utilities',
] as const;

export type Sector = (typeof sectorData)[number];
