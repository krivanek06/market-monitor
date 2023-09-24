import { Controller, Get } from '@nestjs/common';

@Controller('portfolio')
export class PortfolioController {
  @Get('/ee')
  getTest(): string {
    return 'Hello World! Eduard';
  }
}
