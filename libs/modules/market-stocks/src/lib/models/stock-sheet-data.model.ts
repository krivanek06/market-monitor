import { CompanyFinancialsReport } from '@market-monitor/api-types';

export type SheetData = {
  timePeriods: string[];
  data: {
    name: string;
    values: number[];
    isPercentage?: boolean;
  }[];
};

export type SheetDataPeriod = 'financialsAnnual' | 'financialsQuarter';

export type SheetDataTimePeriodForm = {
  timePeriod: SheetDataPeriod;
  sheetKey: keyof CompanyFinancialsReport;
};
