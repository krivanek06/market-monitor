import {
  PortfolioTransaction,
  PortfolioTransactionCreate,
  PortfolioTransactionDelete,
} from '@market-monitor/api-types';
import { Controller, Get } from '@nestjs/common';
import { PortfolioTransactionsService } from './portfolio-transactions/portfolio-transactions.service';

@Controller('portfolio')
export class PortfolioController {
  constructor(private portfolioTransactionsService: PortfolioTransactionsService) {}

  @Get('/executeTransaction')
  executeTransactionOperation(input: PortfolioTransactionCreate): Promise<PortfolioTransaction> {
    return this.portfolioTransactionsService.executeTransactionOperation(input);
  }

  @Get('/deleteTransaction')
  deleteTransactionOperation(input: PortfolioTransactionDelete): Promise<PortfolioTransaction> {
    return this.portfolioTransactionsService.deleteTransactionOperation(input);
  }
}
