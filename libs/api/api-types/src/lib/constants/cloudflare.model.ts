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
export const EXPIRATION_ONE_DAY = 60 * 60 * 24;
export const EXPIRATION_ONE_WEEK = EXPIRATION_ONE_DAY * 7;
