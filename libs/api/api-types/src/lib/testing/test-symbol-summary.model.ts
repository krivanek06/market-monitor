import { SymbolQuote } from '../external-api';
import { SymbolSummary } from '../firebase';

export const quoteAAPLMock = {
  name: 'Apple Inc.',
  symbol: 'AAPL',
  displaySymbol: 'AAPL',
  price: 150.0,
} as SymbolQuote;

export const summaryAAPLMock = {
  id: 'AAPL',
  quote: quoteAAPLMock,
  profile: {
    sector: 'Technology',
  },
  priceChange: {
    ['5D']: 10,
  },
} as SymbolSummary;

export const quoteMSFTMock = {
  name: 'Microsoft Corporation',
  symbol: 'MSFT',
  displaySymbol: 'MSFT',
  price: 120.0,
} as SymbolQuote;

export const summaryMSFTMock = {
  id: 'MSFT',
  quote: quoteMSFTMock,
  profile: {
    sector: 'Technology',
  },
  priceChange: {
    ['5D']: 10,
  },
} as SymbolSummary;

export const quoteNFLXMock = {
  name: 'Netflix Inc.',
  symbol: 'NFLX',
  displaySymbol: 'NFLX',
  price: 100.0,
} as SymbolQuote;

export const summaryNFLXMock = {
  id: 'NFLX',
  quote: quoteNFLXMock,
  profile: {
    sector: 'Technology',
  },
  priceChange: {
    ['5D']: 10,
  },
} as SymbolSummary;
