import { SymbolQuote } from '../external-api';

export type DataDocsWrapper<T> = {
  lastModifiedDate: string;
  data: T[];
};

export type MarketTopPerformance<T> = {
  stockTopGainers: T[];
  stockTopLosers: T[];
  stockTopActive: T[];
};

export type MarketTopPerformanceSymbols = MarketTopPerformance<string> & {};

export type MarketTopPerformanceOverviewResponse = MarketTopPerformance<SymbolQuote> & {};

// ------------------ News ------------------

export const NewsAcceptableTypes = ['general', 'stocks', 'forex', 'crypto'] as const;
export type NewsTypes = (typeof NewsAcceptableTypes)[number];

export type DataSelection = 'all' | 'partial';
export type DataDateValue = { date: string; value: number };
export type DataDateValueArray = { date: string[]; value: number[] };

export type TreasureDataBySections = {
  date: string[];
  month1: number[];
  month3: number[];
  month6: number[];
  year1: number[];
  year2: number[];
  year3: number[];
  year5: number[];
  year7: number[];
  year10: number[];
  year20: number[];
  year30: number[];
};
