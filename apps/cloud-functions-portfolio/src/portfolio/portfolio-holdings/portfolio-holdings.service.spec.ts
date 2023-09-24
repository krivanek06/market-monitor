import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioHoldingsService } from './portfolio-holdings.service';

describe('PortfolioHoldingsService', () => {
  let service: PortfolioHoldingsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioHoldingsService],
    }).compile();

    service = module.get<PortfolioHoldingsService>(PortfolioHoldingsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
