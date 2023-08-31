import { getSymbolOwnershipHolders } from '@market-monitor/api-external';
import { getDatabaseStockOwnershipHoldersRef } from '@market-monitor/api-firebase';
import { SymbolOwnershipHolders } from '@market-monitor/api-types';
import { checkDataValidityDays, isDateValidQuarter } from '@market-monitor/shared-utils-general';
import { Request, Response } from 'express';

export const getOwnershipHoldersToDateWrapper = async (
  request: Request,
  response: Response<SymbolOwnershipHolders[]>,
) => {
  const symbolString = request.query.symbol as string | undefined;
  const dateQuarter = request.query.date as string | undefined;

  // throw error if no symbol or date
  if (!symbolString || !dateQuarter) {
    response.send([]);
    return;
  }

  // check if date is valid quarter
  if (!isDateValidQuarter(dateQuarter)) {
    response.send([]);
    return;
  }

  // check data in DB
  const databaseRef = getDatabaseStockOwnershipHoldersRef(symbolString, dateQuarter);
  const databaseData = (await databaseRef.get()).data();

  // return data if exists
  if (checkDataValidityDays(databaseData)) {
    response.send(databaseData.data);
    return;
  }

  // reload data
  const [page0, page1, page2] = await Promise.all([
    getSymbolOwnershipHolders(symbolString, dateQuarter, 0),
    getSymbolOwnershipHolders(symbolString, dateQuarter, 1),
    getSymbolOwnershipHolders(symbolString, dateQuarter, 2),
  ]);
  const data = [...page0, ...page1, ...page2];

  databaseRef.set({
    data,
    lastUpdate: new Date().toISOString(),
  });
  response.send(data);
};
