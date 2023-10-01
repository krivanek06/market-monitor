import { Module } from '@nestjs/common';
import { ApiService } from './api/api.service';
import { PortfolioGrowthService } from './portfolio-growth/portfolio-growth.service';
import { PortfolioRiskService } from './portfolio-risk/portfolio-risk.service';
import { PortfolioTransactionsService } from './portfolio-transactions/portfolio-transactions.service';
import { PortfolioController } from './portfolio.controller';

@Module({
  controllers: [PortfolioController],
  providers: [PortfolioRiskService, PortfolioGrowthService, PortfolioTransactionsService, ApiService],
})
export class AppModule {}
