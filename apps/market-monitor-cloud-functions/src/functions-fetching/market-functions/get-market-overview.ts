import { Response } from 'express';
/**
 * load data from quandl api
 * - format the data
 * - save into firebase
 * load data from financial modeling prep api
 * - format the data
 * - save into firebase
 *
 * later: create an api to load a spacific market data
 */

import { onRequest } from 'firebase-functions/v2/https';

export const getmarketoverview = onRequest(async (_, response: Response<any>) => {});
