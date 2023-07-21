import { Injectable } from '@angular/core';
import { StockDetails } from '@market-monitor/api-types';
import { EstimatedChartDataType } from '@market-monitor/shared-utils-client';
import { CompanyRatingTable } from '../models';

@Injectable({
  providedIn: 'root',
})
export class StockTransformService {
  constructor() {}

  createCompanyRatingTable(stockDetails: StockDetails): CompanyRatingTable | null {
    const companyRating = stockDetails.rating;
    const companyRatio = stockDetails.ratio;

    if (!companyRating || !companyRatio) {
      return null;
    }

    const ratingDetailsDCFScoreValue = stockDetails.profile.dcf;
    const ratingDetailsROEScoreValue = companyRatio.returnOnEquityTTM;
    const ratingDetailsROAScoreValue = companyRatio.returnOnAssetsTTM;
    const ratingDetailsDEScoreValue = stockDetails.profile.dcf;
    const ratingDetailsPEScoreValue = stockDetails.quote.pe;
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

  createEstimationData(stockDetails: StockDetails): {
    earnings: EstimatedChartDataType[];
    revenue: EstimatedChartDataType[];
  } {
    const earnings = stockDetails.stockEarnings.map((earning) => ({
      date: earning.date,
      valueEst: earning.epsEstimated,
      valueActual: earning.eps,
    }));

    const revenue = stockDetails.stockEarnings.map((earning) => ({
      date: earning.date,
      valueEst: earning.revenueEstimated,
      valueActual: earning.revenue,
    }));

    return { earnings, revenue };
  }

  // createSummaryData(stockDetails: StockDetails): NameValueItem[]{
  //   const companyName = ;
  //   return [
  //     {name: 'Company Name', value: stockDetails.profile.companyName},
  //     {name: 'CEO', value: stockDetails.profile.ceo},
  //   ]

  // }
}
