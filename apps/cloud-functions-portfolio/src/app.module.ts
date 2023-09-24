import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio/portfolio.controller';

@Module({
  controllers: [PortfolioController]
})
export class AppModule {}
