import { CompanyProfile, PriceChange, SymbolQuote } from '../external-api';

export type SymbolSummary = {
  id: string;
  quote: SymbolQuote;
  profile?: CompanyProfile;
  priceChange: PriceChange;
};

export type SymbolType = 'STOCK' | 'CRYPTO' | 'ETF' | 'FUND' | 'CURRENCY';

export type SymbolSearch = {
  symbolType: SymbolType;
  symbol: string;
};
