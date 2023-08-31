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
  priceAvg50: number;
  priceAvg200: number;
  exchange: string;
  volume: number;
  avgVolume: number;
  open: number;
  previousClose: number;
  eps: number | null;
  pe: number;
  earningsAnnouncement: string;
  timestamp: number;

  // value can be null if it is ETF or index
  marketCap: number;
  sharesOutstanding: number;
};

export type CompanyOutlook = {
  // data exists, however removed TS to access it from summary
  profile: CompanyProfile;
  metrics: CompanyMetrics;
  ratios: CompanyRatioTTM[];
  insideTrades: CompanyInsideTrade[];
  keyExecutives: CompanyKeyExecutive[];
  splitsHistory: CompanySplitsHistory[];
  stockDividend: CompanyStockDividend[];
  stockNews: News[];
  rating: CompanyRating[];
  financialsAnnual: CompanyFinancialsReport;
  financialsQuarter: CompanyFinancialsReport;
};

export type TickerSearch = {
  symbol: string;
  name: string;
  currency: string;
  stockExchange: string;
  exchangeShortName: string;
};

export type CompanyProfile = {
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
  sector?: string; // can be empty
};

export type CompanyMetrics = {
  dividendYielTTM: number;
  volume: number;
  yearHigh: number;
  yearLow: number;
};

export type CompanyKeyMetricsTTM = {
  revenuePerShareTTM: number;
  netIncomePerShareTTM: number;
  operatingCashFlowPerShareTTM: number;
  freeCashFlowPerShareTTM: number;
  cashPerShareTTM: number;
  bookValuePerShareTTM: number;
  tangibleBookValuePerShareTTM: number;
  shareholdersEquityPerShareTTM: number;
  interestDebtPerShareTTM: number;
  marketCapTTM: number;
  enterpriseValueTTM: number;
  peRatioTTM: number;
  priceToSalesRatioTTM: number;
  pocfratioTTM: number;
  pfcfRatioTTM: number;
  pbRatioTTM: number;
  ptbRatioTTM: number;
  evToSalesTTM: number;
  enterpriseValueOverEBITDATTM: number;
  evToOperatingCashFlowTTM: number;
  evToFreeCashFlowTTM: number;
  earningsYieldTTM: number;
  freeCashFlowYieldTTM: number;
  debtToEquityTTM: number;
  debtToAssetsTTM: number;
  netDebtToEBITDATTM: number;
  currentRatioTTM: number;
  interestCoverageTTM: number;
  incomeQualityTTM: number;
  dividendYieldTTM: number;
  dividendYieldPercentageTTM: number;
  payoutRatioTTM: number;
  salesGeneralAndAdministrativeToRevenueTTM: number;
  researchAndDevelopementToRevenueTTM: number;
  intangiblesToTotalAssetsTTM: number;
  capexToOperatingCashFlowTTM: number;
  capexToRevenueTTM: number;
  capexToDepreciationTTM: number;
  stockBasedCompensationToRevenueTTM: number;
  grahamNumberTTM: number;
  roicTTM: number;
  returnOnTangibleAssetsTTM: number;
  grahamNetNetTTM: number;
  workingCapitalTTM: number;
  tangibleAssetValueTTM: number;
  netCurrentAssetValueTTM: number;
  investedCapitalTTM: number;
  averageReceivablesTTM: number;
  averagePayablesTTM: number;
  averageInventoryTTM: number;
  daysSalesOutstandingTTM: number;
  daysPayablesOutstandingTTM: number;
  daysOfInventoryOnHandTTM: number;
  receivablesTurnoverTTM: number;
  payablesTurnoverTTM: number;
  inventoryTurnoverTTM: number;
  roeTTM: number;
  capexPerShareTTM: number;
  dividendPerShareTTM: number;
  debtToMarketCapTTM: number;
};

export type CompanyKeyMetrics = {
  symbol: string;
  date: string;
  period: string;
  revenuePerShare: number;
  netIncomePerShare: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  cashPerShare: number;
  bookValuePerShare: number;
  tangibleBookValuePerShare: number;
  shareholdersEquityPerShare: number;
  interestDebtPerShare: number;
  marketCap: number;
  enterpriseValue: number;
  peRatio: number;
  priceToSalesRatio: number;
  pocfratio: number;
  pfcfRatio: number;
  pbRatio: number;
  ptbRatio: number;
  evToSales: number;
  enterpriseValueOverEBITDA: number;
  evToOperatingCashFlow: number;
  evToFreeCashFlow: number;
  earningsYield: number;
  freeCashFlowYield: number;
  debtToEquity: number;
  debtToAssets: number;
  netDebtToEBITDA: number;
  currentRatio: number;
  interestCoverage: number;
  incomeQuality: number;
  dividendYield: number;
  payoutRatio: number;
  salesGeneralAndAdministrativeToRevenue: number;
  researchAndDdevelopementToRevenue: number;
  intangiblesToTotalAssets: number;
  capexToOperatingCashFlow: number;
  capexToRevenue: number;
  capexToDepreciation: number;
  stockBasedCompensationToRevenue: number;
  grahamNumber: number;
  roic: number;
  returnOnTangibleAssets: number;
  grahamNetNet: number;
  workingCapital: number;
  tangibleAssetValue: number;
  netCurrentAssetValue: number;
  investedCapital: number;
  averageReceivables: number;
  averagePayables: number;
  averageInventory: number;
  daysSalesOutstanding: number;
  daysPayablesOutstanding: number;
  daysOfInventoryOnHand: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  roe: number;
  capexPerShare: number;
};

export type CompanyRatioTTM = {
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

export type CompanyRatio = {
  symbol: string;
  date: string;
  period: string;
  currentRatio: number;
  quickRatio: number;
  cashRatio: number;
  daysOfSalesOutstanding: number;
  daysOfInventoryOutstanding: number;
  operatingCycle: number;
  daysOfPayablesOutstanding: number;
  cashConversionCycle: number;
  grossProfitMargin: number;
  operatingProfitMargin: number;
  pretaxProfitMargin: number;
  netProfitMargin: number;
  effectiveTaxRate: number;
  returnOnAssets: number;
  returnOnEquity: number;
  returnOnCapitalEmployed: number;
  netIncomePerEBT: number;
  ebtPerEbit: number;
  ebitPerRevenue: number;
  debtRatio: number;
  debtEquityRatio: number;
  longTermDebtToCapitalization: number;
  totalDebtToCapitalization: number;
  interestCoverage: number;
  cashFlowToDebtRatio: number;
  companyEquityMultiplier: number;
  receivablesTurnover: number;
  payablesTurnover: number;
  inventoryTurnover: number;
  fixedAssetTurnover: number;
  assetTurnover: number;
  operatingCashFlowPerShare: number;
  freeCashFlowPerShare: number;
  cashPerShare: number;
  payoutRatio: number;
  operatingCashFlowSalesRatio: number;
  freeCashFlowOperatingCashFlowRatio: number;
  cashFlowCoverageRatios: number;
  shortTermCoverageRatios: number;
  capitalExpenditureCoverageRatio: number;
  dividendPaidAndCapexCoverageRatio: number;
  dividendPayoutRatio: number;
  priceBookValueRatio: number;
  priceToBookRatio: number;
  priceToSalesRatio: number;
  priceEarningsRatio: number;
  priceToFreeCashFlowsRatio: number;
  priceToOperatingCashFlowsRatio: number;
  priceCashFlowRatio: number;
  priceEarningsToGrowthRatio: number;
  priceSalesRatio: number;
  dividendYield: number;
  enterpriseValueMultiple: number;
  priceFairValue: number;
};

export type CompanyInsideTrade = {
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

export type CompanyKeyExecutive = {
  title: string;
  name: string;
  pay?: number;
  currencyPay: string;
  gender: string;
  yearBorn?: number;
  titleSince?: number;
};

export type CompanySplitsHistory = {
  date: string;
  label: string;
  numerator: number;
  denominator: number;
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

export type CompanyRating = {
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

export type CompanyFinancialsReport = {
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

export interface EnterpriseValue {
  symbol: string;
  date: string;
  stockPrice: number;
  numberOfShares: number;
  marketCapitalization: number;
  minusCashAndCashEquivalents: number;
  addTotalDebt: number;
  enterpriseValue: number;
}

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

export type CompanyStockDividend = {
  date: string;
  label: string;
  adjDividend: number | null;
  symbol: string;
  dividend: number | null;
  recordDate: string | null;
  paymentDate: string | null;
  declarationDate: string | null;
};

export type StockEarning = {
  date: string;
  symbol: string;
  eps: number | null;
  epsEstimated: number | null;
  time: string;
  revenue: number | null;
  revenueEstimated: number | null;
  fiscalDateEnding: string;
  updatedFromDate: string;
};

export type CalendarStockIPO = {
  symbol: string;
  cik: string;
  acceptedDate: string;
  filingDate: string;
  pricePublicPerShare: number;
  pricePublicTotal: number;
  discountsAndCommissionsPerShare: number;
  discountsAndCommissionsTotal: number;
  proceedsBeforeExpensesPerShare: number;
  proceedsBeforeExpensesTotal: number;
  form: string;
  date: string;
  url: string;
};

export type SymbolOwnershipHolders = {
  date: string;
  cik: string;
  filingDate: string;
  investorName: string;
  symbol: string;
  securityName: string;
  typeOfSecurity: string;
  securityCusip: string;
  sharesType: string;
  putCallShare: string;
  investmentDiscretion: string;
  industryTitle: string;
  weight: number;
  lastWeight: number;
  changeInWeight: number;
  changeInWeightPercentage: number;
  marketValue: number;
  lastMarketValue: number;
  changeInMarketValue: number;
  changeInMarketValuePercentage: number;
  sharesNumber: number;
  lastSharesNumber: number;
  changeInSharesNumber: number;
  changeInSharesNumberPercentage: number;
  quarterEndPrice: number;
  avgPricePaid: number;
  isNew: boolean;
  isSoldOut: boolean;
  ownership: number;
  lastOwnership: number;
  changeInOwnership: number;
  changeInOwnershipPercentage: number;
  holdingPeriod: number;
  firstAdded: string;
  performance: number;
  performancePercentage: number;
  lastPerformance: number;
  changeInPerformance: number;
  isCountedForPerformance: boolean;
};

export type SymbolOwnershipInstitutional = {
  symbol: string;
  cik: string;
  date: string;
  investorsHolding: number;
  lastInvestorsHolding: number;
  investorsHoldingChange: number;
  numberOf13Fshares: number;
  lastNumberOf13Fshares: number;
  numberOf13FsharesChange: number;
  totalInvested: number;
  lastTotalInvested: number;
  totalInvestedChange: number;
  ownershipPercent: number;
  lastOwnershipPercent: number;
  ownershipPercentChange: number;
  newPositions: number;
  lastNewPositions: number;
  newPositionsChange: number;
  increasedPositions: number;
  lastIncreasedPositions: number;
  increasedPositionsChange: number;
  closedPositions: number;
  lastClosedPositions: number;
  closedPositionsChange: number;
  reducedPositions: number;
  lastReducedPositions: number;
  reducedPositionsChange: number;
  totalCalls: number;
  lastTotalCalls: number;
  totalCallsChange: number;
  totalPuts: number;
  lastTotalPuts: number;
  totalPutsChange: number;
  putCallRatio: number;
  lastPutCallRatio: number;
  putCallRatioChange: number;
};
