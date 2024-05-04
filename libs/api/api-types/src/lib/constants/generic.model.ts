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
