import { Component, input, output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { PortfolioState, PortfolioStateHolding, PortfolioStateHoldings } from '@mm/api-types';
import { StockSummaryDialogComponent } from '@mm/market-stocks/features';
import { SCREEN_DIALOGS } from '@mm/shared/dialog-manager';
import { GeneralCardComponent, ShowMoreButtonComponent } from '@mm/shared/ui';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { PortfolioHoldingsTableComponent } from '../tables';
import { PortfolioHoldingsTableCardComponent } from './portfolio-holdings-table-card.component';

@Component({
  selector: 'app-portfolio-holdings-table',
  standalone: true,
  template: ``,
})
class PortfolioHoldingsTableComponentStub {
  symbolClicked = output<string>();
  holdings = input<PortfolioStateHolding[]>();
  portfolioState = input<PortfolioState>();
  displayedColumns = input<string[]>();
}

describe('PortfolioHoldingsTableCardComponent', () => {
  const holdingTableS = '[data-testid="portfolio-holding-table-card-table"]';
  const showMoreS = '[data-testid="portfolio-holding-table-card-show-more"]';
  const startSectionS = '[data-testid="portfolio-holding-table-card-start"]';

  const mockPortfolioState = {
    balance: 0,
    cashOnHand: 0,
    invested: 0,
    holdingsBalance: 0,
    holdings: [
      {
        symbol: 'AAPL',
      },
      {
        symbol: 'MSFT',
      },
      {
        symbol: 'NFLX',
      },
      {
        symbol: 'AAL',
      },
      {
        symbol: 'CCL',
      },
    ] as PortfolioStateHoldings['holdings'],
  } as PortfolioStateHoldings;

  beforeEach(() => {
    return MockBuilder(PortfolioHoldingsTableCardComponent)
      .keep(GeneralCardComponent)
      .replace(PortfolioHoldingsTableComponent, PortfolioHoldingsTableComponentStub)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .keep(NoopAnimationsModule)
      .mock(ShowMoreButtonComponent)
      .provide({
        provide: MatDialog,
        useValue: {
          open: jest.fn(),
        },
      });
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should create', () => {
    const fixture = MockRender(PortfolioHoldingsTableCardComponent, {
      portfolioStateHolding: undefined,
    });
    const component = fixture.point.componentInstance;
    expect(component).toBeTruthy();
    expect(component.initialItemsLimit()).toBe(15);
  });

  it('should have selected holdings by initial limit', () => {
    const fixture = MockRender(PortfolioHoldingsTableCardComponent, {
      portfolioStateHolding: mockPortfolioState,
      initialItemsLimit: 3,
    });
    const component = fixture.point.componentInstance;

    expect(component.selectedHoldings().length).toBe(3);

    // find show more button
    const shoeMoreButton = ngMocks.find(showMoreS);

    expect(shoeMoreButton).toBeTruthy();

    // click show more button
    component.selectedHoldingsToggle.set(true);

    // check if all holdings are displayed
    expect(component.selectedHoldings().length).toBe(5);

    // click show more button
    component.selectedHoldingsToggle.set(false);

    // check displayed holdings
    expect(component.selectedHoldings().length).toBe(3);
  });

  it('should scroll to start section when selected holdings are toggled', () => {
    const fixture = MockRender(PortfolioHoldingsTableCardComponent, {
      portfolioStateHolding: mockPortfolioState,
    });
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    // find start section
    const startSection = fixture.debugElement.query(By.css(startSectionS));

    expect(startSection).toBeFalsy();
    expect(component.startSectionRef()).toBeFalsy();

    // click show more button
    component.selectedHoldingsToggle.set(true);

    fixture.detectChanges();

    // find start section again
    const startSection2 = fixture.debugElement.query(By.css(startSectionS));

    const scrollRef = component.startSectionRef()!;

    expect(startSection2).toBeTruthy();
    expect(scrollRef).toBeTruthy();
    expect(scrollRef?.nativeElement).toBeTruthy();

    // create spy for scrollIntoView
    scrollRef.nativeElement = {
      scrollIntoView: jest.fn(),
    };

    // click show more button
    component.selectedHoldingsToggle.set(false);

    fixture.detectChanges();

    // check if start section is scrolled to
    expect(scrollRef.nativeElement.scrollIntoView).toHaveBeenCalledWith({
      behavior: 'smooth',
      inline: 'center',
      block: 'center',
    });

    // find start section
    const startSection3 = fixture.debugElement.query(By.css(startSectionS));

    expect(startSection3).toBeFalsy();
    expect(component.startSectionRef()).toBeFalsy();
  });

  it('should display summary dialog on holding click', () => {
    const fixture = MockRender(PortfolioHoldingsTableCardComponent, {
      portfolioStateHolding: mockPortfolioState,
    });
    const component = fixture.point.componentInstance;
    const dialog = ngMocks.get(MatDialog);
    const summarySpy = jest.spyOn(component, 'onSummaryClick');

    fixture.detectChanges();

    // find holding table
    const holdingTable = ngMocks.find(PortfolioHoldingsTableComponentStub);

    expect(holdingTable).toBeTruthy();

    // emit symbol click
    holdingTable.componentInstance.symbolClicked.emit('AAPL');

    // check if dialog is opened
    expect(summarySpy).toHaveBeenCalledWith('AAPL');
    expect(dialog.open).toHaveBeenCalledWith(StockSummaryDialogComponent, {
      data: {
        symbol: 'AAPL',
      },
      panelClass: [SCREEN_DIALOGS.DIALOG_BIG],
    });
  });
});
