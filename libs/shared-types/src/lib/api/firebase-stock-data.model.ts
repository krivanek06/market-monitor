import {
	AnalystEstimatesEarnings,
	CompanyOutlook,
	ESGDataQuarterly,
	ESGDataRatingYearly,
	PriceTarget,
	Profile,
	SectorPeers,
	StockNews,
	StockPriceChange,
	SymbolQuote,
	UpgradesDowngrades,
} from './financial-modeling-starter.model';
import { RecommendationTrends } from './finnhub.model';

export type StockSummary = {
	id: string;
	reloadData: boolean;
	quote: SymbolQuote;
	profile: Profile;
	priceChange: StockPriceChange;
	summaryLastUpdate: string;
};

export type StockDetails = {
	reloadData: boolean;
	companyOutlook: Omit<CompanyOutlook, 'profile'>;
	esgDataRatingYearlyArray: ESGDataRatingYearly[];
	esgDataRatingYearly: ESGDataRatingYearly | null;
	esgDataQuarterlyArray: ESGDataQuarterly[];
	esgDataQuarterly: ESGDataQuarterly | null;
	upgradesDowngrades: UpgradesDowngrades[];
	priceTarget: PriceTarget[];
	analystEstimatesEarnings: AnalystEstimatesEarnings[];
	sectorPeers: SectorPeers[];
	recommendationTrends: RecommendationTrends[];
	stockNews: StockNews[];
	lastUpdate: {
		newsLastUpdate: string;
		detailsLastUpdate: string;
	};
};

export enum SymbolHistoricalPeriods {
	day = '1d',
	week = '1w',
	month = '1mo',
	threeMonths = '3mo',
	sixMonths = '6mo',
	year = '1y',
	fiveYears = '5y',
	ytd = 'ytd',
	all = 'all',
}
/**
 * Stock data details from the pro api for pro members
 */
// export interface StockDataDetailsPro {}
