import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioGrowthService } from './portfolio-growth.service';

describe('PortfolioGrowthService', () => {
  let service: PortfolioGrowthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioGrowthService],
    }).compile();

    service = module.get<PortfolioGrowthService>(PortfolioGrowthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
