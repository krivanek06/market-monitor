import { GROUP_MEMBER_LIMIT, GROUP_OWNER_LIMIT, OUTSTANDING_ORDERS_MAX_ORDERS } from './constants.model';

// general
export const GENERAL_NOT_SUFFICIENT_PERMISSIONS_ERROR = 'Not sufficient permissions';

// user
export const USER_NOT_FOUND_ERROR = 'User not found';
export const USER_NOT_ENOUGH_CASH_ERROR = 'Not enough cash on hand';
export const USER_NOT_UNITS_ON_HAND_ERROR = 'Not enough units on hand';
export const USER_NOT_AUTHENTICATED_ERROR = 'User not authenticated';
export const USER_HAS_DEMO_ACCOUNT_ERROR = 'User has demo account, operation not allowed';
export const USER_INCORRECT_ACCOUNT_TYPE_ERROR = 'Incorrect account type, operation not allowed';
export const USER_HOLDING_LIMIT_ERROR = 'User can not have more symbols in their holdings';

// symbol
export const SYMBOL_NOT_FOUND_ERROR = 'Symbol not found';

// transaction
export const TRANSACTION_HISTORY_NOT_FOUND_ERROR = 'No transaction history found';
export const TRANSACTION_INPUT_UNITS_POSITIVE = 'Units must be positive';
export const TRANSACTION_INPUT_UNITS_INTEGER = 'Units must be integer';

// date
export const DATE_INVALID_DATE = 'Invalid date';
export const DATE_WEEKEND = 'Weekend date not allowed';
export const DATE_FUTURE = 'Future date not allowed';
export const DATE_TOO_OLD = 'Date too old';

// groups
export const GROUP_NOT_FOUND_ERROR = 'Group not found';
export const GROUP_USER_NOT_OWNER = 'User is not owner';
export const GROUP_ALREADY_CLOSED_ERROR = 'Group is already closed';
export const GROUP_SAME_NAME_ERROR = 'Group with same name already exists';
export const GROUP_OWNER_LIMIT_ERROR = `User can only create ${GROUP_OWNER_LIMIT} groups`;
export const GROUP_MEMBERS_LIMIT_ERROR = `Group can only have ${GROUP_MEMBER_LIMIT} members`;
export const GROUP_USER_ALREADY_MEMBER_ERROR = 'User is already a member';
export const GROUP_USER_HAS_NO_INVITATION_ERROR = 'User has no invitation';
export const GROUP_USER_ALREADY_REQUESTED_ERROR = 'User already requested to join';
export const GROUPS_USER_ALREADY_INVITED_ERROR = 'User already invited';
export const GROUP_IS_FULL_ERROR = 'Group is full';
export const GROUP_USER_IS_OWNER_ERROR = 'User is owner';
export const GROUP_CLOSED = 'Group is closed';

// orders
export const OUTSTANDING_ORDER_MAX_ALLOWED = `You can have maximum ${OUTSTANDING_ORDERS_MAX_ORDERS} outstanding orders`;
export const DATA_NOT_FOUND_ERROR = 'Data not found';
