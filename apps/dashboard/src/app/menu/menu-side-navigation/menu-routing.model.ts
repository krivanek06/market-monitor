import { ROUTES_MAIN } from '@market-monitor/shared/data-access';

export const sideNavigation = {
  mainNavigation: [
    {
      path: ROUTES_MAIN.DASHBOARD,
      title: 'Dashboard',
      icon: 'dashboard',
    },
    {
      path: ROUTES_MAIN.WATCHLIST,
      title: 'Watchlist',
      icon: 'monitoring',
    },
    {
      path: ROUTES_MAIN.TRADING,
      title: 'Trading',
      icon: 'attach_money',
    },
    {
      path: ROUTES_MAIN.SETTING,
      title: 'Settings',
      icon: 'settings',
    },
  ],
  marketNavigation: [
    {
      path: ROUTES_MAIN.STOCK_SCREENER,
      title: 'Screener',
      icon: 'query_stats',
    },
    {
      path: ROUTES_MAIN.TOP_PERFORMERS,
      title: 'Performers',
      icon: 'travel_explore',
    },
    {
      path: ROUTES_MAIN.MARKET,
      title: 'Market',
      icon: 'storefront',
    },
    {
      path: ROUTES_MAIN.MARKET_CALENDAR,
      title: 'Calendar',
      icon: 'calendar_month',
    },
  ],
} as const;
