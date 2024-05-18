import { SymbolQuote } from '../external-api';
import { SymbolSummary } from '../firebase';

export const quoteAAPLMock = {
  name: 'Apple Inc.',
  symbol: 'AAPL',
  price: 150.0,
} as SymbolQuote;

export const summaryAAPLMock = {
  id: 'AAPL',
  quote: quoteAAPLMock,
  profile: {
    sector: 'Technology',
  },
} as SymbolSummary;

export const quoteMSFTMock = {
  name: 'Microsoft Corporation',
  symbol: 'MSFT',
  price: 120.0,
} as SymbolQuote;

export const summaryMSFTMock = {
  id: 'MSFT',
  quote: quoteMSFTMock,
  profile: {
    sector: 'Technology',
  },
} as SymbolSummary;

export const quoteNFLXMock = {
  name: 'Netflix Inc.',
  symbol: 'NFLX',
  price: 100.0,
} as SymbolQuote;

export const summaryNFLXMock = {
  id: 'NFLX',
  quote: quoteNFLXMock,
  profile: {
    sector: 'Technology',
  },
} as SymbolSummary;
