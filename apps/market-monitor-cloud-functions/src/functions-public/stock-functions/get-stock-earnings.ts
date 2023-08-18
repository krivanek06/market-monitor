import { getStockHistoricalEarnings } from '@market-monitor/api-external';
import { getDatabaseStockDetailsRef } from '@market-monitor/api-firebase';
import { StockDetailsAPI, StockEarning } from '@market-monitor/api-types';
import { isBefore, subDays } from 'date-fns';
import { Request, Response } from 'express';

export const getStockEarningsWrapper = async (request: Request, response: Response<StockEarning[]>) => {
  const symbol = request.query.symbol as string;

  // throw error if no symbols
  if (!symbol) {
    response.send([]);
    return;
  }
  // create DB calls
  const databaseStockDetailsRef = getDatabaseStockDetailsRef(symbol);

  const databaseStockDetailsData = (await databaseStockDetailsRef.get()).data();

  // check if data is not older than 7 days
  if (
    databaseStockDetailsData &&
    !isBefore(new Date(databaseStockDetailsData.lastUpdate.earningLastUpdate), subDays(new Date(), 7))
  ) {
    response.send(databaseStockDetailsData.stockEarnings);
    return;
  }

  // reload data
  const stockEarnings = await getStockHistoricalEarnings(symbol);

  const dataToSave: Partial<StockDetailsAPI> = {
    stockEarnings,
  };

  // save to DB
  await databaseStockDetailsRef.set(
    {
      ...dataToSave,
      lastUpdate: {
        ...databaseStockDetailsData?.lastUpdate,
        earningLastUpdate: new Date().toISOString(),
      },
    },
    { merge: true },
  );

  response.send(stockEarnings);
};
