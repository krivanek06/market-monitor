import { Injectable } from '@angular/core';
import { StockDetails } from '@market-monitor/api-types';
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
}
