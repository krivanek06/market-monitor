import { Module } from '@nestjs/common';
import { PortfolioGrowthService } from './portfolio/portfolio-growth/portfolio-growth.service';
import { PortfolioHoldingsService } from './portfolio/portfolio-holdings/portfolio-holdings.service';
import { PortfolioRiskService } from './portfolio/portfolio-risk/portfolio-risk.service';
import { PortfolioController } from './portfolio/portfolio.controller';

@Module({
  controllers: [PortfolioController],
  providers: [PortfolioRiskService, PortfolioHoldingsService, PortfolioGrowthService],
})
export class AppModule {}
