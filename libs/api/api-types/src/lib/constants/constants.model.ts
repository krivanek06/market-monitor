/**
 * how many members a group can have
 */
export const GROUP_MEMBER_LIMIT = 50;

/**
 * how many groups a user can create
 */
export const GROUP_OWNER_LIMIT = 5;

/**
 * how many symbols a user can have in their holdings
 */
export const USER_HOLDINGS_SYMBOL_LIMIT = 40;

/**
 * how many symbols a user can have in their watchList
 */
export const USER_WATCHLIST_SYMBOL_LIMIT = 40;

/**
 * default cash amount for user when creating a new trading account
 */
export const USER_DEFAULT_STARTING_CASH = 30_000;

/**
 * number how many entities to save for hall of fame portfolio best
 */
export const HALL_OF_FAME_PORTFOLIO_TOP_LIMIT = 75;
/**
 * number how many entities to save for hall of fame portfolio daily change
 */
export const HALL_OF_FAME_PORTFOLIO_DAILY_BEST_LIMIT = 12;

/**
 * limit how far can we load historical prices for a symbol
 */
export const HISTORICAL_PRICE_RESTRICTION_YEARS = 6;

/**
 * users with trading account have a fee prct
 */
export const TRANSACTION_FEE_PRCT = 0.1;

/**
 * number in days when a user account is considered in-active
 */
export const USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT = 60;

/**
 * number in days when a demo user account will be deleted
 */
export const USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT_DEMO = 2;

/**
 * number in days when a normal user account will be deleted after not logging in
 */
export const USER_ACTIVE_ACCOUNT_TIME_DAYS_LIMIT_DELETE = 180;

/**
 * number of demo accounts a user can create per IP
 */
export const USER_ALLOWED_DEMO_ACCOUNTS_PER_IP = 20;

/**
 * how many demo accounts can be inside the application at once
 */
export const USER_ALLOWED_DEMO_ACCOUNTS_TOTAL = 300;

/**
 * limit how many symbols can be in a group holding (which are copied from users holdings)
 */
export const GROUP_HOLDING_LIMIT = 50;

/**
 * limit the number of users who can play the trading simulator in multiplayer mode
 */
export const TRADING_SIMULATOR_MULTIPLAYER_USER_LIMIT = 50;

/**
 * maximum number of rounds in the trading simulator can handle
 */
export const TRADING_SIMULATOR_MAX_ROUNDS = 500;

/**
 * maximum number of instances of trading simulator a user can create
 */
export const TRADING_SIMULATOR_MAX_INSTANCES_PER_USER = 5;
