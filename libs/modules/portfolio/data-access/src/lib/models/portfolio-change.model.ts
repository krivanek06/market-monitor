export type PortfolioChangeValue = {
  value: number;
  valuePrct: number;
};

export type PortfolioChange = {
  '1_day': PortfolioChangeValue;
  '1_week': PortfolioChangeValue;
  '2_week': PortfolioChangeValue;
  '3_week': PortfolioChangeValue;
  '1_month': PortfolioChangeValue;
  '3_month': PortfolioChangeValue;
  '6_month': PortfolioChangeValue;
  '1_year': PortfolioChangeValue;
  beginning: PortfolioChangeValue;
};
