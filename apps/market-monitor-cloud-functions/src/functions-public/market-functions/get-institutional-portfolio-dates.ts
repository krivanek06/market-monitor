import { getInstitutionalPortfolioDates } from '@market-monitor/api-external';
import { getDatabaseInstitutionalPortfolioDatesRef } from '@market-monitor/api-firebase';
import { isBefore, subDays } from 'date-fns';
import { Response } from 'express';

/**
 * returns list of available quarters to load data from different APIs
 */
export const getInstitutionalPortfolioDatesWrapper = async (request, response: Response<string[]>) => {
  const databaseRef = getDatabaseInstitutionalPortfolioDatesRef();
  const databaseData = (await databaseRef.get()).data();

  // check if data exists and not older than 7 days
  const reloadData = !databaseData || isBefore(new Date(databaseData.lastUpdate), subDays(new Date(), 7));

  if (!reloadData) {
    response.send(databaseData.data);
    return;
  }

  const data = await getInstitutionalPortfolioDates();
  databaseRef.set({
    data,
    lastUpdate: new Date().toISOString(),
  });

  // return data
  response.send(data);
};
