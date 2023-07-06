export const AvailableQuotesConst = ['index', 'crypto', 'etf', 'commodity', 'euronext'] as const;
export type AvailableQuotes = (typeof AvailableQuotesConst)[number];
export type SymbolQuote = {
  symbol: string;
  name: string;
  price: number;
  changesPercentage: number;
  change: number;
  dayLow: number;
  dayHigh: number;
  yearHigh: number;
  yearLow: number;
  marketCap: number;
  priceAvg50: number;
  priceAvg200: number;
  exchange: string;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number | null;
  pe: number | null;
  earningsAnnouncement: string;
  sharesOutstanding: number;
  timestamp: number;
};

export type CompanyOutlook = {
  // data exists, however removed TS to access it from summary
  profile: Profile;
  metrics: Metrics;
  ratios: Ratio[];
  insideTrades: InsideTrade[];
  KeyExecutive: KeyExecutive[];
  splitsHistory: SplitsHistory[];
  stockDividend: StockDividend[];
  stockNews: News[];
  rating: Rating[];
  financialsAnnual: FinancialsReport;
  financialsQuarter: FinancialsReport;
};

export type Profile = {
  symbol: string;
  price: number;
  beta: number;
  volAvg: number;
  mktCap: number;
  lastDiv: number;
  range: string;
  changes: number;
  companyName: string;
  currency: string;
  cik: string;
  isin: string;
  cusip: string;
  exchange: string;
  exchangeShortName: string;
  industry: string;
  website: string;
  description: string;
  ceo: string;
  sector: string;
  country: string;
  fullTimeEmployees: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  dcfDiff: number;
  dcf: number;
  image: string;
  ipoDate: string;
  defaultImage: boolean;
  isEtf: boolean;
  isActivelyTrading: boolean;
  isAdr: boolean;
  isFund: boolean;
};

export type Metrics = {
  dividendYielTTM: number;
  volume: number;
  yearHigh: number;
  yearLow: number;
};

export type Ratio = {
  dividendYielTTM: number;
  dividendYielPercentageTTM: number;
  peRatioTTM: number;
  pegRatioTTM: number;
  payoutRatioTTM: number;
  currentRatioTTM: number;
  quickRatioTTM: number;
  cashRatioTTM: number;
  daysOfSalesOutstandingTTM: number;
  daysOfInventoryOutstandingTTM: number;
  operatingCycleTTM: number;
  daysOfPayablesOutstandingTTM: number;
  cashConversionCycleTTM: number;
  grossProfitMarginTTM: number;
  operatingProfitMarginTTM: number;
  pretaxProfitMarginTTM: number;
  netProfitMarginTTM: number;
  effectiveTaxRateTTM: number;
  returnOnAssetsTTM: number;
  returnOnEquityTTM: number;
  returnOnCapitalEmployedTTM: number;
  netIncomePerEBTTTM: number;
  ebtPerEbitTTM: number;
  ebitPerRevenueTTM: number;
  debtRatioTTM: number;
  debtEquityRatioTTM: number;
  longTermDebtToCapitalizationTTM: number;
  totalDebtToCapitalizationTTM: number;
  interestCoverageTTM: number;
  cashFlowToDebtRatioTTM: number;
  companyEquityMultiplierTTM: number;
  receivablesTurnoverTTM: number;
  payablesTurnoverTTM: number;
  inventoryTurnoverTTM: number;
  fixedAssetTurnoverTTM: number;
  assetTurnoverTTM: number;
  operatingCashFlowPerShareTTM: number;
  freeCashFlowPerShareTTM: number;
  cashPerShareTTM: number;
  operatingCashFlowSalesRatioTTM: number;
  freeCashFlowOperatingCashFlowRatioTTM: number;
  cashFlowCoverageRatiosTTM: number;
  shortTermCoverageRatiosTTM: number;
  capitalExpenditureCoverageRatioTTM: number;
  dividendPaidAndCapexCoverageRatioTTM: number;
  priceBookValueRatioTTM: number;
  priceToBookRatioTTM: number;
  priceToSalesRatioTTM: number;
  priceEarningsRatioTTM: number;
  priceToFreeCashFlowsRatioTTM: number;
  priceToOperatingCashFlowsRatioTTM: number;
  priceCashFlowRatioTTM: number;
  priceEarningsToGrowthRatioTTM: number;
  priceSalesRatioTTM: number;
  dividendYieldTTM: number;
  enterpriseValueMultipleTTM: number;
  priceFairValueTTM: number;
  dividendPerShareTTM: number;
};

export type InsideTrade = {
  symbol: string;
  filingDate: string;
  transactionDate: string;
  reportingCik: string;
  transactionType: string;
  securitiesOwned: number;
  companyCik: string;
  reportingName: string;
  typeOfOwner: string;
  acquistionOrDisposition: string;
  formType: string;
  securitiesTransacted: number;
  price: number;
  securityName: string;
  link: string;
};

export type KeyExecutive = {
  title: string;
  name: string;
  pay?: number;
  currencyPay: string;
  gender: string;
  yearBorn?: number;
  titleSince?: number;
};

export type SplitsHistory = {
  date: string;
  label: string;
  numerator: number;
  denominator: number;
};

export type StockDividend = {
  date: string;
  label: string;
  adjDividend: number;
  dividend: number;
  recordDate: string;
  paymentDate: string;
  declarationDate: string;
};

export type News = {
  symbol: string;
  publishedDate: string;
  title: string;
  image: string;
  site: string;
  text: string;
  url: string;
};

export type Rating = {
  symbol: string;
  date: string;
  rating: string;
  ratingScore: number;
  ratingRecommendation: string;
  ratingDetailsDCFScore: number;
  ratingDetailsDCFRecommendation: string;
  ratingDetailsROEScore: number;
  ratingDetailsROERecommendation: string;
  ratingDetailsROAScore: number;
  ratingDetailsROARecommendation: string;
  ratingDetailsDEScore: number;
  ratingDetailsDERecommendation: string;
  ratingDetailsPEScore: number;
  ratingDetailsPERecommendation: string;
  ratingDetailsPBScore: number;
  ratingDetailsPBRecommendation: string;
};

export type FinancialsReport = {
  income: FinancialIncome[];
  balance: FinancialBalance[];
  cash: FinancialCash[];
};

export type FinancialIncome = {
  date: string;
  symbol: string;
  reportedCurrency: string;
  cik: string;
  fillingDate: string;
  acceptedDate: string;
  calendarYear: string;
  period: string;
  revenue: number;
  costOfRevenue: number;
  grossProfit: number;
  grossProfitRatio: number;
  researchAndDevelopmentExpenses: number;
  generalAndAdministrativeExpenses: number;
  sellingAndMarketingExpenses: number;
  sellingGeneralAndAdministrativeExpenses: number;
  otherExpenses: number;
  operatingExpenses: number;
  costAndExpenses: number;
  interestIncome: number;
  interestExpense: number;
  depreciationAndAmortization: number;
  ebitda: number;
  ebitdaratio: number;
  operatingIncome: number;
  operatingIncomeRatio: number;
  totalOtherIncomeExpensesNet: number;
  incomeBeforeTax: number;
  incomeBeforeTaxRatio: number;
  incomeTaxExpense: number;
  netIncome: number;
  netIncomeRatio: number;
  eps: number;
  epsdiluted: number;
  weightedAverageShsOut: number;
  weightedAverageShsOutDil: number;
  link: string;
  finalLink: string;
};

export type FinancialBalance = {
  date: string;
  symbol: string;
  reportedCurrency: string;
  cik: string;
  fillingDate: string;
  acceptedDate: string;
  calendarYear: string;
  period: string;
  cashAndCashEquivalents: number;
  shortTermInvestments: number;
  cashAndShortTermInvestments: number;
  netReceivables: number;
  inventory: number;
  otherCurrentAssets: number;
  totalCurrentAssets: number;
  propertyPlantEquipmentNet: number;
  goodwill: number;
  intangibleAssets: number;
  goodwillAndIntangibleAssets: number;
  longTermInvestments: number;
  taxAssets: number;
  otherNonCurrentAssets: number;
  totalNonCurrentAssets: number;
  otherAssets: number;
  totalAssets: number;
  accountPayables: number;
  shortTermDebt: number;
  taxPayables: number;
  deferredRevenue: number;
  otherCurrentLiabilities: number;
  totalCurrentLiabilities: number;
  longTermDebt: number;
  deferredRevenueNonCurrent: number;
  deferredTaxLiabilitiesNonCurrent: number;
  otherNonCurrentLiabilities: number;
  totalNonCurrentLiabilities: number;
  otherLiabilities: number;
  capitalLeaseObligations: number;
  totalLiabilities: number;
  preferredStock: number;
  commonStock: number;
  retainedEarnings: number;
  accumulatedOtherComprehensiveIncomeLoss: number;
  othertotalStockholdersEquity: number;
  totalStockholdersEquity: number;
  totalEquity: number;
  totalLiabilitiesAndStockholdersEquity: number;
  minorityInterest: number;
  totalLiabilitiesAndTotalEquity: number;
  totalInvestments: number;
  totalDebt: number;
  netDebt: number;
  link: string;
  finalLink: string;
};

export type FinancialCash = {
  date: string;
  symbol: string;
  reportedCurrency: string;
  cik: string;
  fillingDate: string;
  acceptedDate: string;
  calendarYear: string;
  period: string;
  netIncome: number;
  depreciationAndAmortization: number;
  deferredIncomeTax: number;
  stockBasedCompensation: number;
  changeInWorkingCapital: number;
  accountsReceivables: number;
  inventory: number;
  accountsPayables: number;
  otherWorkingCapital: number;
  otherNonCashItems: number;
  netCashProvidedByOperatingActivities: number;
  investmentsInPropertyPlantAndEquipment: number;
  acquisitionsNet: number;
  purchasesOfInvestments: number;
  salesMaturitiesOfInvestments: number;
  otherInvestingActivites: number;
  netCashUsedForInvestingActivites: number;
  debtRepayment: number;
  commonStockIssued: number;
  commonStockRepurchased: number;
  dividendsPaid: number;
  otherFinancingActivites: number;
  netCashUsedProvidedByFinancingActivities: number;
  effectOfForexChangesOnCash: number;
  netChangeInCash: number;
  cashAtEndOfPeriod: number;
  cashAtBeginningOfPeriod: number;
  operatingCashFlow: number;
  capitalExpenditure: number;
  freeCashFlow: number;
  link: string;
  finalLink: string;
};

export type ESGDataRatingYearly = {
  symbol: string;
  cik: string;
  companyName: string;
  industry: string;
  year: number;
  ESGRiskRating: string;
  industryRank: string;
};

export type ESGDataQuarterly = {
  symbol: string;
  cik: string;
  companyName: string;
  formType: string;
  acceptedDate: string;
  date: string;
  environmentalScore: number;
  socialScore: number;
  governanceScore: number;
  ESGScore: number;
  url: string;
};

export type UpgradesDowngrades = {
  symbol: string;
  publishedDate: string;
  newsURL: string;
  newsTitle: string;
  newsBaseURL: string;
  newsPublisher: string;
  newGrade: string;
  previousGrade: string;
  gradingCompany: string;
  action: string;
  priceWhenPosted: number;
};

export type PriceTarget = {
  symbol: string;
  publishedDate: string;
  newsURL: string;
  newsTitle: string;
  analystName: string;
  priceTarget: number;
  adjPriceTarget: number;
  priceWhenPosted: number;
  newsPublisher: string;
  newsBaseURL: string;
  analystCompany: string;
};

export type Earnings = {
  date: string;
  symbol: string;
  actualEarningResult: number;
  estimatedEarning: number;
};

export type AnalystEstimates = {
  symbol: string;
  date: string;
  estimatedRevenueLow: number;
  estimatedRevenueHigh: number;
  estimatedRevenueAvg: number;
  estimatedEbitdaLow: number;
  estimatedEbitdaHigh: number;
  estimatedEbitdaAvg: number;
  estimatedEbitLow: number;
  estimatedEbitHigh: number;
  estimatedEbitAvg: number;
  estimatedNetIncomeLow: number;
  estimatedNetIncomeHigh: number;
  estimatedNetIncomeAvg: number;
  estimatedSgaExpenseLow: number;
  estimatedSgaExpenseHigh: number;
  estimatedSgaExpenseAvg: number;
  estimatedEpsAvg: number;
  estimatedEpsHigh: number;
  estimatedEpsLow: number;
  numberAnalystEstimatedRevenue: number;
  numberAnalystsEstimatedEps: number;
};

export type AnalystEstimatesEarnings = {
  date: string;
  symbol: string;
  eps: number | null;
  epsEstimated: number;
  time: string;
  revenue: number | null;
  revenueEstimated: number;
  updatedFromDate: string;
  fiscalDateEnding: string;
};

export type SectorPeers = {
  symbol: string;
  peersList: string[];
};

export type PriceChange = {
  symbol: string;
  '1D': number | null;
  '5D': number | null;
  '1M': number | null;
  '3M': number | null;
  '6M': number | null;
  ytd: number | null;
  '1Y': number | null;
  '3Y': number | null;
  '5Y': number | null;
  '10Y': number | null;
  max: number;
};

export interface TickerSearch {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  low: number;
  high: number;
  close: number;
  volume: number;
}

export interface MostPerformingStocks {
  symbol: string;
  name: string;
  change: number;
  price: number;
  changesPercentage: number;
}

export interface StockScreenerResults {
  symbol: string;
  companyName: string;
  marketCap: number;
  sector: string;
  industry: string;
  beta: number;
  price: number;
  lastAnnualDividend: number;
  volume: number;
  exchange: string;
  exchangeShortName: string;
  country: string;
  isEtf: boolean;
  isActivelyTrading: boolean;
}

export const STOCK_SECTORS = [
  'Consumer Cyclical',
  'Energy',
  'Technology',
  'Industrials',
  'Financial Services',
  'Basic Materials',
  'Communication Services',
  'Consumer Defensive',
  'Healthcare',
  'Real Estate',
  'Utilities',
  'Industrial Goods',
  'Financial',
  'Services',
  'Conglomerates',
] as const;

export const STOCK_INDUSTRIES = [
  'Autos',
  'Banks',
  'Banks Diversified',
  'Software',
  'Banks Regional',
  'Beverages Alcoholic',
  'Beverages Brewers',
  'Beverages Non-Alcoholic',
] as const;

export const STOCK_EXCHANGES = ['nyse', 'nasdaq', 'amex'] as const;

export type StockSectorTypes = (typeof STOCK_SECTORS)[number];
export type StockIndustryTypes = (typeof STOCK_INDUSTRIES)[number];
export type StockExchangeTypes = (typeof STOCK_EXCHANGES)[number];
export type StockScreenerArray = [number | null, number | null] | null;
export type StockScreenerValues = {
  country: string | null;
  industry: StockIndustryTypes | null;
  sector: StockSectorTypes | null;
  exchange: StockExchangeTypes | null;
  marketCap: StockScreenerArray;
  price: StockScreenerArray;
  volume: StockScreenerArray;
  dividends: StockScreenerArray;
};
