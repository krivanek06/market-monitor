import { SymbolHistoricalPeriods } from '@market-monitor/shared-types';

export const timePeriodDefaultButtons = [
  { labelButton: '1D', labelSelect: '1 day', value: SymbolHistoricalPeriods.day },
  { labelButton: '1W', labelSelect: '1 week', value: SymbolHistoricalPeriods.week },
  { labelButton: '1M', labelSelect: '1 month', value: SymbolHistoricalPeriods.month },
  { labelButton: '3M', labelSelect: '3 months', value: SymbolHistoricalPeriods.threeMonths },
  { labelButton: '6M', labelSelect: '6 months', value: SymbolHistoricalPeriods.sixMonths },
  { labelButton: '1Y', labelSelect: '1 year', value: SymbolHistoricalPeriods.year },
  { labelButton: '5Y', labelSelect: '5 years', value: SymbolHistoricalPeriods.fiveYears },
  { labelButton: 'YTD', labelSelect: 'year to date', value: SymbolHistoricalPeriods.ytd },
  { labelButton: 'ALL', labelSelect: 'All', value: SymbolHistoricalPeriods.all },
] as const;
