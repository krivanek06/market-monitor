import { Injectable } from '@angular/core';
import { StockDetails } from '@market-monitor/api-types';
import { NameValueItem } from '@market-monitor/shared-components';
import { EstimatedChartDataType } from '@market-monitor/shared-utils-client';
import { formatLargeNumber, roundNDigits } from '@market-monitor/shared-utils-general';
import { CompanyRatingTable, SheetData, SheetDataPeriod } from '../models';

@Injectable({
  providedIn: 'root',
})
export class StockTransformService {
  constructor() {}

  createCompanyRatingTable(data?: StockDetails): CompanyRatingTable | null {
    if (!data) {
      return null;
    }

    const companyRating = data.rating;
    const companyRatio = data.ratio;

    if (!companyRating || !companyRatio) {
      return null;
    }

    const ratingDetailsDCFScoreValue = data.profile.dcf;
    const ratingDetailsROEScoreValue = companyRatio.returnOnEquityTTM;
    const ratingDetailsROAScoreValue = companyRatio.returnOnAssetsTTM;
    const ratingDetailsDEScoreValue = data.profile.dcf;
    const ratingDetailsPEScoreValue = data.quote.pe;
    const ratingDetailsPBScoreValue = companyRatio.priceToBookRatioTTM;

    const result = {
      ...companyRating,
      ratingDetailsDCFScoreValue,
      ratingDetailsROEScoreValue,
      ratingDetailsROAScoreValue,
      ratingDetailsDEScoreValue,
      ratingDetailsPEScoreValue,
      ratingDetailsPBScoreValue,
    } satisfies CompanyRatingTable;

    return result;
  }

  createEstimationData(data?: StockDetails): {
    earnings: EstimatedChartDataType[];
    revenue: EstimatedChartDataType[];
  } {
    if (!data) {
      return {
        earnings: [],
        revenue: [],
      };
    }

    const earnings = data.stockEarnings
      .map((earning) => ({
        date: earning.date,
        valueEst: earning.epsEstimated,
        valueActual: earning.eps,
      }))
      .reverse();

    const revenue = data.stockEarnings
      .map((earning) => ({
        date: earning.date,
        valueEst: earning.revenueEstimated,
        valueActual: earning.revenue,
      }))
      .reverse();

    return { earnings, revenue };
  }

  createFinancialStrength(data?: StockDetails): NameValueItem[] {
    if (!data) {
      return [];
    }

    const enterprise = `${formatLargeNumber(data.companyKeyMetricsTTM.enterpriseValueTTM)} (${roundNDigits(
      data.ratio.enterpriseValueMultipleTTM,
      2,
    )})`;
    const stockBasedCompensation = `${formatLargeNumber(
      data.additionalFinancialData.stockBasedCompensation,
    )} (${roundNDigits(data.companyKeyMetricsTTM.stockBasedCompensationToRevenueTTM, 2)})`;
    const totalEquity = `${formatLargeNumber(data.companyKeyMetricsTTM.tangibleAssetValueTTM)} (${roundNDigits(
      data.ratio.companyEquityMultiplierTTM,
      2,
    )})`;

    return [
      { name: 'Revenue', value: formatLargeNumber(data.additionalFinancialData.revenue) },
      { name: 'Cost Of Revenue', value: formatLargeNumber(data.additionalFinancialData.costOfRevenue) },
      { name: 'Total Assets', value: formatLargeNumber(data.additionalFinancialData.totalAssets) },
      { name: 'Current Assets', value: formatLargeNumber(data.additionalFinancialData.shortTermDebt) },
      { name: 'Net Current Assets', value: formatLargeNumber(data.companyKeyMetricsTTM.netCurrentAssetValueTTM) },
      { name: 'Total Debt', value: formatLargeNumber(data.additionalFinancialData.totalDebt) },
      { name: 'Short Term Debt', value: formatLargeNumber(data.additionalFinancialData.shortTermDebt) },
      { name: 'EBITDA', value: formatLargeNumber(data.additionalFinancialData.EBITDA) },
      { name: 'Operating Cash Flow', value: formatLargeNumber(data.additionalFinancialData.operatingCashFlow) },
      { name: 'Free Cash Flow', value: formatLargeNumber(data.additionalFinancialData.freeCashFlow) },
      { name: 'Net Income', value: formatLargeNumber(data.additionalFinancialData.netIncome) },
      { name: 'Cash on Hand', value: formatLargeNumber(data.additionalFinancialData.cashOnHand) },
      { name: 'Working Capital', value: formatLargeNumber(data.companyKeyMetricsTTM.workingCapitalTTM) },
      { name: 'Enterprise Value (Multiplier)', value: enterprise },
      { name: 'Total Equity (Multiplier)', value: totalEquity },
      { name: 'Stock Comp. (to Revenue)', value: stockBasedCompensation },
    ];
  }

  createFinancialRatio1(data?: StockDetails): NameValueItem[] {
    if (!data) {
      return [];
    }

    return [
      { name: 'Current Ratio', value: roundNDigits(data.ratio.currentRatioTTM, 2) },
      { name: 'Quick Ratio', value: roundNDigits(data.ratio.quickRatioTTM, 2) },
      { name: 'Cash Ratio', value: roundNDigits(data.ratio.cashRatioTTM, 2) },
      { name: 'PEG Ratio', value: roundNDigits(data.ratio.pegRatioTTM, 2) },
      { name: 'Price / Book Ratio', value: roundNDigits(data.ratio.priceToBookRatioTTM, 2) },
      { name: 'Price / Sales Ratio', value: roundNDigits(data.ratio.priceToSalesRatioTTM, 2) },
      { name: 'Price / Earnings Growth', value: roundNDigits(data.ratio.priceEarningsToGrowthRatioTTM, 2) },
      { name: 'Price / Cash Flow Ratio', value: roundNDigits(data.ratio.priceCashFlowRatioTTM, 2) },
      {
        name: 'Price / Operating Cash Flow Ratio',
        value: roundNDigits(data.ratio.priceToOperatingCashFlowsRatioTTM, 2),
      },
      { name: 'Price / Free Cash Flow Ratio', value: roundNDigits(data.ratio.priceToFreeCashFlowsRatioTTM, 2) },
      { name: 'Debt Ratio', value: roundNDigits(data.ratio.debtRatioTTM, 2) },
      { name: 'Debt / Equity Ratio', value: roundNDigits(data.ratio.debtEquityRatioTTM, 2) },
      { name: 'Debt / Market Cap. Ratio', value: roundNDigits(data.companyKeyMetricsTTM.debtToMarketCapTTM, 2) },
      { name: 'Cash Flow to Debt Ratio', value: roundNDigits(data.ratio.cashFlowToDebtRatioTTM, 2) },
      { name: 'Operating Cash Flow / Sales Ratio', value: roundNDigits(data.ratio.operatingCashFlowSalesRatioTTM, 2) },
      {
        name: 'Free Cash Flow / Operating CF Ratio',
        value: roundNDigits(data.ratio.freeCashFlowOperatingCashFlowRatioTTM, 2),
      },
      { name: 'Cash Flow Coverage Ratio', value: roundNDigits(data.ratio.cashFlowCoverageRatiosTTM, 2) },
    ];
  }

  createFinancialRatio2(data?: StockDetails): NameValueItem[] {
    if (!data) {
      return [];
    }

    return [
      { name: 'Short Term Coverage Ratio', value: roundNDigits(data.ratio.shortTermCoverageRatiosTTM, 2) },
      {
        name: 'Capital Expenditure Coverage Ratio',
        value: roundNDigits(data.ratio.capitalExpenditureCoverageRatioTTM, 2),
      },
      { name: 'Interest Coverage Ratio', value: roundNDigits(data.ratio.interestCoverageTTM, 2) },
      { name: 'EBT / Ebit', value: roundNDigits(data.ratio.ebtPerEbitTTM, 2) },
      { name: 'Ebit / Revenue', value: roundNDigits(data.ratio.ebitPerRevenueTTM, 2) },
      { name: 'Net Income / Ebit', value: roundNDigits(data.ratio.netIncomePerEBTTTM, 2) },
      { name: 'Enterprise Value / Sales', value: roundNDigits(data.companyKeyMetricsTTM.evToSalesTTM, 2) },
      {
        name: 'Enterprise Value / Operating Cash Flow',
        value: roundNDigits(data.companyKeyMetricsTTM.evToOperatingCashFlowTTM, 2),
      },
      {
        name: 'Enterprise Value / Free Cash Flow',
        value: roundNDigits(data.companyKeyMetricsTTM.evToFreeCashFlowTTM, 2),
      },
      { name: 'Fixed Asset Turnover', value: roundNDigits(data.ratio.fixedAssetTurnoverTTM, 2) },
      { name: 'Asset Turnover', value: roundNDigits(data.ratio.assetTurnoverTTM, 2) },
      { name: 'Long Term Debt / Capitalization', value: roundNDigits(data.ratio.totalDebtToCapitalizationTTM, 2) },
      {
        name: 'Dividend Pay & CAPEX Coverage',
        value: roundNDigits(data.ratio.dividendPaidAndCapexCoverageRatioTTM, 2),
      },
      { name: 'CAPEX to OFC', value: roundNDigits(data.companyKeyMetricsTTM.capexToOperatingCashFlowTTM, 2) },
      { name: 'CAPEX to Revenue', value: roundNDigits(data.companyKeyMetricsTTM.capexToRevenueTTM, 2) },
      { name: 'CAPEX to Depreciation', value: roundNDigits(data.companyKeyMetricsTTM.capexToDepreciationTTM, 2) },
    ];
  }

  createFinancialPerShare(data?: StockDetails): NameValueItem[] {
    if (!data) {
      return [];
    }

    return [
      { name: 'Revenue / Share', value: roundNDigits(data.companyKeyMetricsTTM.revenuePerShareTTM, 2) },
      { name: 'Book Value / Share', value: roundNDigits(data.companyKeyMetricsTTM.bookValuePerShareTTM, 2) },
      { name: 'Cash / Share', value: roundNDigits(data.companyKeyMetricsTTM.cashPerShareTTM, 2) },
      {
        name: 'Operating Cash / Share',
        value: roundNDigits(data.companyKeyMetricsTTM.operatingCashFlowPerShareTTM, 2),
      },
      { name: 'Free Cash Flow / Share', value: roundNDigits(data.companyKeyMetricsTTM.freeCashFlowPerShareTTM, 2) },
      { name: 'Net Income / Share', value: roundNDigits(data.companyKeyMetricsTTM.netIncomePerShareTTM, 2) },
      { name: 'Interest Debt / Share', value: roundNDigits(data.companyKeyMetricsTTM.interestDebtPerShareTTM, 2) },
      { name: 'CAPEX / Share', value: roundNDigits(data.companyKeyMetricsTTM.capexPerShareTTM, 2) },
    ];
  }

  createFinancialOperatingData(data?: StockDetails): NameValueItem[] {
    if (!data) {
      return [];
    }

    const payables = `${formatLargeNumber(data.companyKeyMetricsTTM.averagePayablesTTM)} (${roundNDigits(
      data.ratio.payablesTurnoverTTM,
      2,
    )})`;

    const inventory = `${formatLargeNumber(data.companyKeyMetricsTTM.averageInventoryTTM)} (${roundNDigits(
      data.ratio.inventoryTurnoverTTM,
      2,
    )})`;

    const receivables = `${formatLargeNumber(data.companyKeyMetricsTTM.averageReceivablesTTM)} (${roundNDigits(
      data.ratio.receivablesTurnoverTTM,
      2,
    )})`;

    return [
      { name: 'Average Receivables (Turnover)', value: receivables },
      { name: 'Average Payables (Turnover)', value: payables },
      { name: 'Average Inventory (Turnover)', value: inventory },
      { name: 'Days Of Sales Outstanding', value: roundNDigits(data.ratio.daysOfSalesOutstandingTTM, 2) },
      { name: 'Days Of Payables Outstanding', value: roundNDigits(data.ratio.daysOfPayablesOutstandingTTM, 2) },
      { name: 'Days Of Inventory Outstanding', value: roundNDigits(data.ratio.daysOfInventoryOutstandingTTM, 2) },
      { name: 'Operating Cycle days', value: roundNDigits(data.ratio.operatingCycleTTM, 2) },
      { name: 'Cash Conversion Cycle days', value: roundNDigits(data.ratio.cashConversionCycleTTM, 2) },
    ];
  }

  createFinancialDividends(data?: StockDetails): NameValueItem[] {
    if (!data || data.companyOutlook.stockDividend.length === 0) {
      return [];
    }

    const dividendData = data.additionalFinancialData.dividends;
    const stockDividends = data.companyOutlook.stockDividend;

    const dividendPaid = `${formatLargeNumber(Math.abs(dividendData.dividendsPaid))} (${roundNDigits(
      dividendData.payoutRatioTTM,
      2,
      true,
    )}%)`;

    return [
      { name: 'Paid Dividends (Percent)', value: dividendPaid },
      { name: 'Dividend / Share', value: roundNDigits(dividendData.dividendPerShareTTM, 2) },
      { name: 'Dividend Yield', value: `${roundNDigits(dividendData.dividendYielPercentageTTM, 2)}%` },
      ...stockDividends.map((d) => ({ name: d.label, value: roundNDigits(d.dividend, 2) })),
    ];
  }

  createSheetDataFromBalanceSheet(period: SheetDataPeriod, data?: StockDetails): SheetData | null {
    if (!data) {
      return null;
    }
    const balanceSheet = data.companyOutlook[period].balance;
    const timePeriods = balanceSheet.map((d) => `${d.period}, ${d.calendarYear}`);

    return {
      timePeriods,
      data: [
        { name: 'Total Assets', values: balanceSheet.map((d) => d.totalAssets) },
        { name: 'Cash & Short-Term Investments', values: balanceSheet.map((d) => d.cashAndShortTermInvestments) },
        { name: 'Cash On Hand', values: balanceSheet.map((d) => d.cashAndCashEquivalents) },
        // { name: 'Other Assets', values: balanceSheet.map((d) => d.otherAssets), },
        { name: 'Goodwill', values: balanceSheet.map((d) => d.goodwill) },
        { name: 'Intangible Assets', values: balanceSheet.map((d) => d.intangibleAssets) },
        { name: 'Total Investments', values: balanceSheet.map((d) => d.totalInvestments) },
        { name: 'Long-Term Investments', values: balanceSheet.map((d) => d.longTermInvestments) },
        { name: 'Short-Term Investments', values: balanceSheet.map((d) => d.shortTermInvestments) },
        { name: 'Total Non-Current Assets', values: balanceSheet.map((d) => d.totalNonCurrentAssets) },
        { name: 'Other Non-Current Assets', values: balanceSheet.map((d) => d.otherNonCurrentAssets) },
        { name: 'Total Equity', values: balanceSheet.map((d) => d.totalEquity) },
        { name: 'Total Debt', values: balanceSheet.map((d) => d.totalDebt) },
        { name: 'Long-Term Debt', values: balanceSheet.map((d) => d.longTermDebt) },
        { name: 'Short-Term Debt', values: balanceSheet.map((d) => d.shortTermDebt) },
        { name: 'Net Debt', values: balanceSheet.map((d) => d.netDebt) },
        { name: 'Total Liabilities', values: balanceSheet.map((d) => d.totalLiabilities) },
        { name: 'Current Liabilities', values: balanceSheet.map((d) => d.totalCurrentLiabilities) },
        { name: 'Non Current Liabilities', values: balanceSheet.map((d) => d.totalNonCurrentLiabilities) },
        { name: 'Account Payables', values: balanceSheet.map((d) => d.accountPayables) },
        { name: 'Net Receivables', values: balanceSheet.map((d) => d.netReceivables) },
        { name: 'Tax Payables', values: balanceSheet.map((d) => d.taxPayables) },
        { name: 'Deferred Tax Liabilities', values: balanceSheet.map((d) => d.deferredTaxLiabilitiesNonCurrent) },
        { name: 'Deferred Revenue', values: balanceSheet.map((d) => d.deferredRevenue) },
        { name: 'Non-Current Deferred Revenue', values: balanceSheet.map((d) => d.deferredRevenueNonCurrent) },
        { name: 'Preferred Stock', values: balanceSheet.map((d) => d.preferredStock) },
        { name: 'Property Plan Equipment', values: balanceSheet.map((d) => d.propertyPlantEquipmentNet) },
        { name: 'Retained Earnings', values: balanceSheet.map((d) => d.retainedEarnings) },
        { name: 'Minority Interest', values: balanceSheet.map((d) => d.minorityInterest) },
        { name: 'Inventory', values: balanceSheet.map((d) => d.inventory) },
        { name: 'Capital Lease Obligations', values: balanceSheet.map((d) => d.capitalLeaseObligations) },
        { name: 'Common Stock', values: balanceSheet.map((d) => d.commonStock) },
        { name: 'Retained Earnings', values: balanceSheet.map((d) => d.retainedEarnings) },
        {
          name: 'Accumulated Comprehensive IncomeLoss',
          values: balanceSheet.map((d) => d.accumulatedOtherComprehensiveIncomeLoss),
        },
      ],
    };
  }

  createSheetDataFromCashFlow(period: SheetDataPeriod, data?: StockDetails): SheetData | null {
    if (!data) {
      return null;
    }
    const cashFlow = data.companyOutlook[period].cash;
    const timePeriods = cashFlow.map((d) => `${d.period}, ${d.calendarYear}`);

    return {
      timePeriods,
      data: [
        { name: 'Net Income', values: cashFlow.map((d) => d.netIncome) },
        { name: 'Depreciation & Amortization', values: cashFlow.map((d) => d.depreciationAndAmortization) },
        { name: 'Deferred Income Tax', values: cashFlow.map((d) => d.deferredIncomeTax) },
        { name: 'Cash at Beginning of Period', values: cashFlow.map((d) => d.cashAtBeginningOfPeriod) },
        { name: 'Cash at End of Period', values: cashFlow.map((d) => d.cashAtEndOfPeriod) },
        { name: 'Net Change in Cash', values: cashFlow.map((d) => d.netChangeInCash) },
        { name: 'Operating Cash Flow', values: cashFlow.map((d) => d.operatingCashFlow) },
        { name: 'Capital Expenditure', values: cashFlow.map((d) => d.capitalExpenditure) },
        { name: 'Free Cash Flow', values: cashFlow.map((d) => d.freeCashFlow) },
        { name: 'Operating Activities', values: cashFlow.map((d) => d.netCashProvidedByOperatingActivities) },
        { name: 'Investing Activites', values: cashFlow.map((d) => d.netCashUsedForInvestingActivites) },
        { name: 'Other Investment Activities', values: cashFlow.map((d) => d.otherInvestingActivites) },
        { name: 'Financing Activities', values: cashFlow.map((d) => d.netCashUsedProvidedByFinancingActivities) },
        { name: 'Other Financial Activities', values: cashFlow.map((d) => d.otherFinancingActivites) },
        { name: 'Stock Based Compensation', values: cashFlow.map((d) => d.stockBasedCompensation) },
        { name: 'Change in Working Capital', values: cashFlow.map((d) => d.changeInWorkingCapital) },
        { name: 'Other Working Capital', values: cashFlow.map((d) => d.otherWorkingCapital) },
        { name: 'Accounts Receivables', values: cashFlow.map((d) => d.accountsReceivables) },
        { name: 'Inventory', values: cashFlow.map((d) => d.inventory) },
        { name: 'Accounts Payables', values: cashFlow.map((d) => d.accountsPayables) },
        { name: 'Other Non-Cash Items', values: cashFlow.map((d) => d.otherNonCashItems) },
        { name: 'Property, Plant & Equipment', values: cashFlow.map((d) => d.investmentsInPropertyPlantAndEquipment) },
        { name: 'Acquisitions, Net', values: cashFlow.map((d) => d.acquisitionsNet) },
        { name: 'Purchases of Investments', values: cashFlow.map((d) => d.purchasesOfInvestments) },
        { name: 'Sales/Maturities of Investments', values: cashFlow.map((d) => d.salesMaturitiesOfInvestments) },
        { name: 'Debt Repayment', values: cashFlow.map((d) => d.debtRepayment) },
        { name: 'Common Stock Issued', values: cashFlow.map((d) => d.commonStockIssued) },
        { name: 'Common Stock Repurchased', values: cashFlow.map((d) => d.commonStockRepurchased) },
        { name: 'Dividends Paid', values: cashFlow.map((d) => d.dividendsPaid) },
        { name: 'Effect of Forex Changes on Cash', values: cashFlow.map((d) => d.effectOfForexChangesOnCash) },
      ],
    };
  }

  createSheetDataFromIncomeStatement(period: SheetDataPeriod, data?: StockDetails): SheetData | null {
    if (!data) {
      return null;
    }
    const incomeStatement = data.companyOutlook[period].income;
    const timePeriods = incomeStatement.map((d) => `${d.period}, ${d.calendarYear}`);

    return {
      timePeriods,
      data: [
        { name: 'Revenue', values: incomeStatement.map((d) => d.revenue) },
        { name: 'Cost of Revenue', values: incomeStatement.map((d) => d.costOfRevenue) },
        { name: 'Gross Profit', values: incomeStatement.map((d) => d.grossProfit) },
        { name: 'Research & Development', values: incomeStatement.map((d) => d.researchAndDevelopmentExpenses) },
        {
          name: 'Selling, General & Admin',
          values: incomeStatement.map((d) => d.sellingGeneralAndAdministrativeExpenses),
        },
        { name: 'General & Administrative', values: incomeStatement.map((d) => d.generalAndAdministrativeExpenses) },
        { name: 'Selling & Marketing', values: incomeStatement.map((d) => d.sellingAndMarketingExpenses) },
        { name: 'Operating Expenses', values: incomeStatement.map((d) => d.operatingExpenses) },
        { name: 'Cost And Expenses', values: incomeStatement.map((d) => d.costAndExpenses) },
        { name: 'Other Expenses', values: incomeStatement.map((d) => d.otherExpenses) },
        { name: 'Interest Expense', values: incomeStatement.map((d) => d.interestExpense) },
        { name: 'Total Other Income Expenses', values: incomeStatement.map((d) => d.totalOtherIncomeExpensesNet) },
        { name: 'Interest Income', values: incomeStatement.map((d) => d.interestIncome) },
        { name: 'EBITDA', values: incomeStatement.map((d) => d.ebitda) },
        { name: 'EBITDA Ratio', values: incomeStatement.map((d) => d.ebitdaratio) },
        { name: 'Operating Income', values: incomeStatement.map((d) => d.operatingIncome) },
        { name: 'Operating Income Ratio', values: incomeStatement.map((d) => d.operatingIncomeRatio) },
        { name: 'Income Before Tax', values: incomeStatement.map((d) => d.incomeBeforeTax) },
        { name: 'Income Before Tax Ratio', values: incomeStatement.map((d) => d.incomeBeforeTaxRatio) },
        { name: 'Income Tax Expense', values: incomeStatement.map((d) => d.incomeTaxExpense) },
        { name: 'Gross Profit', values: incomeStatement.map((d) => d.grossProfit) },
        { name: 'Gross Profit Ratio', values: incomeStatement.map((d) => d.grossProfitRatio) },
        { name: 'Net Income', values: incomeStatement.map((d) => d.netIncome) },
        { name: 'Net Income Ratio', values: incomeStatement.map((d) => d.netIncomeRatio) },
        { name: 'EPS', values: incomeStatement.map((d) => d.eps) },
        { name: 'EPS Diluted', values: incomeStatement.map((d) => d.epsdiluted) },
        { name: 'Weighted Average Shares', values: incomeStatement.map((d) => d.weightedAverageShsOut) },
        { name: 'Weighted Average Shares', values: incomeStatement.map((d) => d.weightedAverageShsOut) },
      ],
    };
  }
}
