import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioTransactionsService } from './portfolio-transactions.service';

describe('PortfolioCrudService', () => {
  let service: PortfolioTransactionsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioTransactionsService],
    }).compile();

    service = module.get<PortfolioTransactionsService>(PortfolioTransactionsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
