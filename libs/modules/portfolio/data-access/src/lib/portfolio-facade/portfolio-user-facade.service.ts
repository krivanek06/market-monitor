import { Injectable } from '@angular/core';
import { PortfolioGrowthAssets, PortfolioTransaction } from '@market-monitor/api-types';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { GenericChartSeriesPie } from '@market-monitor/shared/data-access';
import { Observable, map, switchMap } from 'rxjs';
import { PortfolioGrowth, PortfolioState, PortfolioTransactionCreate } from '../models';
import { PortfolioCalculationService } from '../portfolio-calculation/portfolio-calculation.service';
import { PortfolioGrowthService } from '../portfolio-growth/portfolio-growth.service';
import { PortfolioOperationsService } from '../portfolio-operations/portfolio-operations.service';

/**
 * service for authenticated user to perform portfolio operations
 */
@Injectable({
  providedIn: 'root',
})
export class PortfolioUserFacadeService {
  constructor(
    private authenticationUserService: AuthenticationUserService,
    private portfolioGrowthService: PortfolioGrowthService,
    private PortfolioOperationsService: PortfolioOperationsService,
    private portfolioCalculationService: PortfolioCalculationService,
  ) {}

  getPortfolioState(): Observable<PortfolioState> {
    return this.authenticationUserService
      .getUserPortfolioTransactions()
      .pipe(switchMap((transactions) => this.portfolioGrowthService.getPortfolioState(transactions)));
  }

  getPortfolioGrowthAssets(): Observable<PortfolioGrowthAssets[]> {
    return this.authenticationUserService
      .getUserPortfolioTransactions()
      .pipe(switchMap((transactions) => this.portfolioGrowthService.getPortfolioGrowthAssets(transactions)));
  }

  getPortfolioGrowth(): Observable<PortfolioGrowth[]> {
    return this.getPortfolioGrowthAssets().pipe(
      map((transactions) => this.portfolioCalculationService.getPortfolioGrowth(transactions)),
    );
  }

  getPortfolioSectorAllocationPieChart(): Observable<GenericChartSeriesPie> {
    return this.getPortfolioState().pipe(
      map((state) => this.portfolioCalculationService.getPortfolioSectorAllocationPieChart(state.holdings)),
    );
  }

  getPortfolioAssetAllocationPieChart(): Observable<GenericChartSeriesPie> {
    return this.getPortfolioState().pipe(
      map((state) => this.portfolioCalculationService.getPortfolioAssetAllocationPieChart(state.holdings)),
    );
  }

  createTransactionOperation(input: PortfolioTransactionCreate): Promise<PortfolioTransaction> {
    return this.PortfolioOperationsService.createTransactionOperation(input);
  }

  deleteTransactionOperation(transactionId: string): Promise<PortfolioTransaction> {
    return this.PortfolioOperationsService.deleteTransactionOperation(transactionId);
  }
}
