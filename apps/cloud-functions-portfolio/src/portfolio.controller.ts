import {
  PortfolioGrowthAssets,
  PortfolioTransaction,
  PortfolioTransactionCreate,
  PortfolioTransactionDelete,
} from '@market-monitor/api-types';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PortfolioGrowthService } from './portfolio-growth/portfolio-growth.service';
import { PortfolioTransactionsService } from './portfolio-transactions/portfolio-transactions.service';

@Controller('portfolio')
export class PortfolioController {
  constructor(
    private portfolioTransactionsService: PortfolioTransactionsService,
    private portfolioGrowthService: PortfolioGrowthService,
  ) {}

  @Get('/getPortfolioGrowthAssetsByUserId')
  getPortfolioGrowthAssetsByUserId(@Param() userId: string): Promise<PortfolioGrowthAssets[]> {
    return this.portfolioGrowthService.getPortfolioGrowthAssetsByUserId(userId);
  }

  @Post('/executeTransaction')
  executeTransactionOperation(@Body() input: PortfolioTransactionCreate): Promise<PortfolioTransaction> {
    return this.portfolioTransactionsService.executeTransactionOperation(input);
  }

  @Get('/deleteTransaction')
  deleteTransactionOperation(@Param() input: PortfolioTransactionDelete): Promise<PortfolioTransaction> {
    return this.portfolioTransactionsService.deleteTransactionOperation(input);
  }
}
