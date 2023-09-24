import { Test, TestingModule } from '@nestjs/testing';
import { PortfolioRiskService } from './portfolio-risk.service';

describe('PortfolioRiskService', () => {
  let service: PortfolioRiskService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PortfolioRiskService],
    }).compile();

    service = module.get<PortfolioRiskService>(PortfolioRiskService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
