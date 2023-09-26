import { Module } from '@nestjs/common';
import { PortfolioGrowthService } from './portfolio/portfolio-growth/portfolio-growth.service';
import { PortfolioHoldingsService } from './portfolio/portfolio-holdings/portfolio-holdings.service';
import { PortfolioRiskService } from './portfolio/portfolio-risk/portfolio-risk.service';
import { PortfolioTransactionsService } from './portfolio/portfolio-transactions/portfolio-transactions.service';
import { PortfolioController } from './portfolio/portfolio.controller';

@Module({
  controllers: [PortfolioController],
  providers: [PortfolioRiskService, PortfolioHoldingsService, PortfolioGrowthService, PortfolioTransactionsService],
})
export class AppModule {}
