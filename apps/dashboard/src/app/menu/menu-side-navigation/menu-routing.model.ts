export const sideNavigation = {
  mainNavigation: [
    {
      path: 'dashboard',
      title: 'Dashboard',
      icon: 'dashboard',
    },
    {
      path: 'watchlist',
      title: 'Watchlist',
      icon: 'monitoring',
    },
    {
      path: 'trading',
      title: 'Trading',
      icon: 'attach_money',
    },
    {
      path: 'settings',
      title: 'Settings',
      icon: 'settings',
    },
  ],
  marketNavigation: [
    {
      path: 'screener',
      title: 'Screener',
      icon: 'dashboard',
    },
    {
      path: 'performer',
      title: 'Performers',
      icon: 'dashboard',
    },
    {
      path: 'market',
      title: 'Market',
      icon: 'dashboard',
    },
    {
      path: 'calendar',
      title: 'Calendar',
      icon: 'dashboard',
    },
  ],
} as const;
