import { ValueItem } from '@mm/shared/data-access';

export type PortfolioChange = {
  '1_day': ValueItem | null;
  '1_week': ValueItem | null;
  '2_week': ValueItem | null;
  '3_week': ValueItem | null;
  '1_month': ValueItem | null;
  '3_month': ValueItem | null;
  '6_month': ValueItem | null;
  '1_year': ValueItem | null;
  total: ValueItem | null;
};
