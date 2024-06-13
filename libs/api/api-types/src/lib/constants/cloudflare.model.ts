// create response header
export const RESPONSE_HEADER = {
  status: 200,
  headers: {
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'content-type': 'application/json;charset=UTF-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
  },
} satisfies ResponseInit;

// create expiration data
export const EXPIRATION_ONE_MINUTE = 60;
export const EXPIRATION_TEN_MINUTES = 60 * 10;
export const EXPIRATION_ONE_HOUR = 60 * 60;
export const EXPIRATION_EIGHT_HOURS = EXPIRATION_ONE_HOUR * 8;
export const EXPIRATION_TWELVE_HOURS = EXPIRATION_ONE_HOUR * 12;
export const EXPIRATION_ONE_DAY = EXPIRATION_ONE_HOUR * 24;
export const EXPIRATION_ONE_WEEK = EXPIRATION_ONE_DAY * 7;
