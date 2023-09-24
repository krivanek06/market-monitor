import { userDocumentRef } from '@market-monitor/api-firebase';
import { Injectable } from '@nestjs/common';
import { format, subDays } from 'date-fns';

@Injectable()
export class PortfolioGrowthService {
  async getPortfolioGrowthAssetsByUserId(userId: string) {
    const userDoc = await userDocumentRef(userId).get();
    const user = userDoc.data();

    // throw error if no user
    if (!user) {
      throw new Error('No user found');
    }

    // get all symbols from holdings
    const holdingSymbols = user.holdings.map((d) => d.symbol);
    const yesterDay = format(subDays(new Date(), 1), 'yyyy-MM-dd');
  }
}
