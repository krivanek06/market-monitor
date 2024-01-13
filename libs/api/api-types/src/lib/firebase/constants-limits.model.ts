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
 * how many days a user can be inactive before their account is deactivated -> isAccountActive = false
 */
export const USER_LOGIN_ACCOUNT_ACTIVE_DAYS = 20;

/**
 * number how many entities to save for hall of fame portfolio best
 */
export const HALL_OF_FAME_PORTFOLIO_TOP_LIMIT = 35;
/**
 * number how many entities to save for hall of fame portfolio daily change
 */
export const HALL_OF_FAME_PORTFOLIO_DAILY_BEST_LIMIT = 10;

/**
 * limit how far can we load historical prices for a symbol
 */
export const HISTORICAL_PRICE_RESTRICTION_YEARS = 6;

/**
 * users with trading account have a fee prct
 */
export const TRANSACTION_FEE_PRCT = 0.1;
