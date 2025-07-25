import { ColorScheme } from '@mm/shared/data-access';

export const Recommendation = {
  StrongSell: {
    value: 'Strong sell',
    color: '#711205',
  },
  Sell: {
    value: 'Sell',
    color: '#a81806',
  },
  Hold: {
    value: 'Hold',
    color: '#a17a2a',
  },
  Buy: {
    value: 'Buy',
    color: '#199419',
  },
  StrongBuy: {
    value: 'Strong Buy',
    color: '#008F88',
  },
} as const;

export const recommendationData = [
  { value: Recommendation.StrongSell.value, color: Recommendation.StrongSell.color },
  { value: Recommendation.Sell.value, color: Recommendation.Sell.color },
  { value: Recommendation.Hold.value, color: Recommendation.Hold.color },
  { value: Recommendation.Buy.value, color: Recommendation.Buy.color },
  { value: Recommendation.StrongBuy.value, color: Recommendation.StrongBuy.color },
] as const;

export const recommendationDefault = {
  value: 'N/A',
  color: ColorScheme.GRAY_MEDIUM_VAR,
};
