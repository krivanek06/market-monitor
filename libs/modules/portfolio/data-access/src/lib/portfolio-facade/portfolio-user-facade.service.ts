import { Injectable } from '@angular/core';
import { PortfolioGrowthAssets, PortfolioTransaction, UserPortfolioTransaction } from '@market-monitor/api-types';
import { AuthenticationUserService } from '@market-monitor/modules/authentication/data-access';
import { GenericChartSeriesPie } from '@market-monitor/shared/data-access';
import { Observable, map, switchMap } from 'rxjs';
import {
  PortfolioChange,
  PortfolioGrowth,
  PortfolioState,
  PortfolioStateHolding,
  PortfolioTransactionCreate,
} from '../models';
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
    private portfolioOperationsService: PortfolioOperationsService,
    private portfolioCalculationService: PortfolioCalculationService,
  ) {}

  getPortfolioState(): Observable<PortfolioState> {
    return this.authenticationUserService
      .getUserPortfolioTransactions()
      .pipe(switchMap((transactions) => this.portfolioGrowthService.getPortfolioState(transactions)));
  }

  getPortfolioStateHolding(symbol: string): Observable<PortfolioStateHolding | undefined> {
    return this.getPortfolioState().pipe(map((state) => state.holdings.find((holding) => holding.symbol === symbol)));
  }

  getUserPortfolioTransactions(): Observable<UserPortfolioTransaction> {
    return this.authenticationUserService.getUserPortfolioTransactions();
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

  getPortfolioChange(): Observable<PortfolioChange> {
    return this.getPortfolioGrowth().pipe(map((growth) => this.portfolioCalculationService.getPortfolioChange(growth)));
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
    return this.portfolioOperationsService.createTransactionOperation(input);
  }

  deleteTransactionOperation(transaction: PortfolioTransaction): void {
    this.portfolioOperationsService.deleteTransactionOperation(transaction);
  }
}
