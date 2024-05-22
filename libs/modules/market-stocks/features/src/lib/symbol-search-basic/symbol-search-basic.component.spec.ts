import { OverlayContainer, OverlayModule } from '@angular/cdk/overlay';
import { signal } from '@angular/core';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MarketApiService } from '@mm/api-client';
import { SymbolQuote, quoteAAPLMock, quoteMSFTMock, quoteNFLXMock } from '@mm/api-types';
import { AUTHENTICATION_ACCOUNT_TOKEN, AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { SymbolFavoriteService, SymbolSearchService } from '@mm/market-stocks/data-access';
import { ElementFocusDirective } from '@mm/shared/ui';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';
import { StockSummaryDialogComponent } from '../stock-summary-dialog/stock-summary-dialog.component';
import { SymbolSearchBasicComponent } from './symbol-search-basic.component';

describe('SymbolSearchBasicComponent', () => {
  const watchlistS = '[data-testid="search-basic-watchlist-checkbox"]';
  const overlayContentS = '[data-testid="search-basic-overlay"]';
  const overlayS = '.cdk-overlay-pane';
  const formFieldInputS = '[data-testid="search-basic-input"]';
  const formSearchedResultsS = '[test-id="search-basic-quotes"]';
  const noDataS = '[data-testid="search-basic-no-data"]';

  // used to change injection token from undefined to some value before rendering component
  let authServiceMockValue: AuthenticationUserStoreService | undefined = {} as AuthenticationUserStoreService;

  const quoteDef1Mock = {
    name: 'Default 1',
    symbol: 'Def1',
  } as SymbolQuote;
  const quoteDef2Mock = {
    name: 'Default 2',
    symbol: 'Def2',
  } as SymbolQuote;

  beforeAll(() => {
    authServiceMockValue = {} as AuthenticationUserStoreService;
  });

  beforeEach(() => {
    return (
      MockBuilder(SymbolSearchBasicComponent)
        .keep(MatCheckboxModule)
        .keep(MatFormFieldModule)
        .keep(MatInputModule)
        //.keep(MatInput)
        .keep(MatAutocompleteModule)
        .keep(ElementFocusDirective)
        .keep(OverlayModule)
        .keep(NoopAnimationsModule)
        //.keep(MatSelectModule)
        //.keep(FormsModule)
        //.keep(ReactiveFormsModule)
        .keep(NG_MOCKS_ROOT_PROVIDERS)
        .provide({
          provide: SymbolFavoriteService,
          useValue: {
            getFavoriteSymbols: jest.fn().mockReturnValue([]),
          },
        })
        .provide({
          provide: MarketApiService,
          useValue: {
            searchQuotesByPrefix: jest.fn().mockReturnValue(of([])),
          },
        })
        .provide({
          provide: SymbolSearchService,
          useValue: {
            addSearchedSymbol: jest.fn(),
            getSearchedSymbols: () => [],
            getDefaultSymbols: () => [quoteDef1Mock, quoteDef2Mock],
          },
        })
        .provide({
          provide: MatDialog,
          useValue: {
            open: jest.fn(),
          },
        })
        .provide({
          provide: AUTHENTICATION_ACCOUNT_TOKEN,
          useValue: authServiceMockValue,
        })
    );
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should create', () => {
    const fixture = MockRender(SymbolSearchBasicComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });

  it('should not display overlay by default', () => {
    const fixture = MockRender(SymbolSearchBasicComponent);
    const component = fixture.point.componentInstance;
    const overlay = fixture.debugElement.query(By.css(overlayContentS));

    const overlayContainer = ngMocks.get(OverlayContainer);
    const overlayContainerElement = overlayContainer.getContainerElement();
    const overlayPane = overlayContainerElement.querySelector(overlayS);
    const noData = overlayContainerElement.querySelector(noDataS);

    expect(overlay).toBeNull();
    expect(component.isInputFocused()).toBeFalsy();
    expect(overlayPane).toBeNull();
    expect(component.displayQuotes().data.length).toBe(2);
    expect(component.displayQuotes().isLoading).toBeFalsy();
    expect(component.displayQuotes().type).toBe('lastSearched');
    expect(noData).toBeFalsy();
  });

  it('should display overlay when search input field is focused', () => {
    const fixture = MockRender(SymbolSearchBasicComponent);
    const component = fixture.point.componentInstance;

    // find form field and input
    const formFieldInput = ngMocks.find(fixture.debugElement, formFieldInputS);

    const onInputFocusSpy = jest.spyOn(fixture.point.componentInstance, 'onInputFocus');

    // focus on form field
    ngMocks.trigger(formFieldInput, 'focus');

    // Update the view
    fixture.detectChanges();

    // Access the OverlayContainer
    const overlayContainer = ngMocks.get(OverlayContainer);
    const overlayContainerElement = overlayContainer.getContainerElement();
    const overlayPane = overlayContainerElement.querySelector(overlayS);

    // get options
    const options = overlayContainerElement.querySelectorAll(formSearchedResultsS);
    const noData = overlayContainerElement.querySelector(noDataS);

    const overlayContent = overlayContainerElement.querySelector(overlayContentS);

    expect(onInputFocusSpy).toHaveBeenCalled();
    expect(component.isInputFocused()).toBeTruthy();
    expect(overlayPane).toBeTruthy();
    expect(overlayContent).toBeTruthy();
    expect(options.length).toBe(2);
    expect(component.displayQuotes().data.length).toBe(2);
    expect(component.displayQuotes().isLoading).toBeFalsy();
    expect(component.displayQuotes().type).toBe('lastSearched');
    expect(noData).toBeFalsy();
  });

  it('should close overlay when clicked outside of opened overlay', () => {
    const fixture = MockRender(SymbolSearchBasicComponent);
    const component = fixture.point.componentInstance;

    // find form field and input
    const formFieldInput = ngMocks.find(fixture.debugElement, formFieldInputS);

    // focus on form field - opens overlay
    ngMocks.trigger(formFieldInput, 'focus');

    // Update the view
    fixture.detectChanges();

    // Access the OverlayContainer
    const overlayContainer = ngMocks.get(OverlayContainer);
    const overlayContainerElement = overlayContainer.getContainerElement();
    const overlayPane = overlayContainerElement.querySelector(overlayS);

    // find instance of focus element
    const focusOverlay = ngMocks.get(ngMocks.find(overlayContentS), ElementFocusDirective);

    // check if all good
    expect(component.isInputFocused()).toBeTruthy();
    expect(overlayPane).toBeTruthy();
    expect(focusOverlay).toBeTruthy();

    // click outside of overlay
    focusOverlay.outsideClick.emit();

    // Update the view
    fixture.detectChanges();

    // check if overlay is closed
    expect(component.isInputFocused()).toBeFalsy();

    // Access the OverlayContainer (again)
    const overlayContainer2 = ngMocks.get(OverlayContainer);
    const overlayContainerElement2 = overlayContainer2.getContainerElement();
    const overlayPane2 = overlayContainerElement2.querySelector(overlayS);

    // check if overlay is closed
    expect(overlayPane2).toBeFalsy();
  });

  it('should display loaded quotes when user types into search input', () => {
    const marketApi = ngMocks.get(MarketApiService);
    ngMocks.stub(marketApi, {
      searchQuotesByPrefix: jest.fn().mockReturnValue(of([quoteAAPLMock, quoteMSFTMock, quoteNFLXMock])),
    });

    ngMocks.flushTestBed();
    const fixture = MockRender(SymbolSearchBasicComponent);
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    // get input field
    const inputField = ngMocks.find(fixture.debugElement, formFieldInputS);

    // put some value into the input field
    inputField.nativeElement.value = 'AAPL';
    inputField.nativeElement.dispatchEvent(new Event('input'));

    // focus on form field - opens overlay
    ngMocks.trigger(inputField, 'focus');

    fixture.detectChanges();

    // Access the OverlayContainer
    const overlayContainer = ngMocks.get(OverlayContainer);
    const overlayContainerElement = overlayContainer.getContainerElement();
    const overlayPane = overlayContainerElement.querySelector(overlayS);
    // get options
    const options = overlayContainerElement.querySelectorAll(formSearchedResultsS);

    // check if quotes are loaded
    expect(component.searchValue()).toBe('AAPL');
    expect(marketApi.searchQuotesByPrefix).toHaveBeenCalledWith('AAPL');
    expect(component.displayQuotes().data.length).toBe(3);
    expect(component.displayQuotes().isLoading).toBeFalsy();
    expect(component.displayQuotes().type).toBe('searched');
    expect(overlayPane).toBeTruthy();
    expect(options.length).toBe(3);
  });

  it('should display last searched symbols with default ones', () => {
    const symbolSearchService = ngMocks.get(SymbolSearchService);
    ngMocks.stub(symbolSearchService, {
      getSearchedSymbols: signal([quoteAAPLMock, quoteMSFTMock]),
      getDefaultSymbols: signal([quoteDef1Mock, quoteDef2Mock]),
    });

    ngMocks.flushTestBed();

    const fixture = MockRender(SymbolSearchBasicComponent);
    const component = fixture.point.componentInstance;

    fixture.detectChanges();

    // get input field
    const inputField = ngMocks.find(fixture.debugElement, formFieldInputS);
    // focus on form field - opens overlay
    ngMocks.trigger(inputField, 'focus');

    fixture.detectChanges();

    // Access the OverlayContainer
    const overlayContainer = ngMocks.get(OverlayContainer);
    const overlayContainerElement = overlayContainer.getContainerElement();
    const overlayPane = overlayContainerElement.querySelector(overlayS);
    // get options
    const options = overlayContainerElement.querySelectorAll(formSearchedResultsS);

    // check if quotes are loaded
    expect(component.searchValue()).toBe('');
    expect(component.displayQuotes().isLoading).toBeFalsy();
    expect(component.displayQuotes().type).toBe('lastSearched');
    expect(component.displayQuotes().data.length).toBe(4);
    expect(overlayPane).toBeTruthy();
    expect(options.length).toBe(4);
  });

  it('should prevent loading symbol for input with more than 6 characters', () => {
    const fixture = MockRender(SymbolSearchBasicComponent);
    const component = fixture.point.componentInstance;
    const marketApi = ngMocks.get(MarketApiService);

    fixture.detectChanges();

    // get input field
    const inputField = ngMocks.find(fixture.debugElement, formFieldInputS);

    // put some value into the input field
    inputField.nativeElement.value = 'QQQQQQQ';
    inputField.nativeElement.dispatchEvent(new Event('input'));

    // focus on form field - opens overlay
    ngMocks.trigger(inputField, 'focus');

    fixture.detectChanges();

    // Access the OverlayContainer
    const overlayContainer = ngMocks.get(OverlayContainer);
    const overlayContainerElement = overlayContainer.getContainerElement();
    const overlayPane = overlayContainerElement.querySelector(overlayS);
    // get options
    const options = overlayContainerElement.querySelectorAll(formSearchedResultsS);
    // get not data
    const noData = overlayContainerElement.querySelector(noDataS);

    expect(component.searchValue()).toBe('QQQQQQQ');
    expect(component.displayQuotes().isLoading).toBeFalsy();
    expect(component.displayQuotes().noData).toBeTruthy();
    expect(overlayPane).toBeTruthy();
    expect(options.length).toBe(0);
    expect(noData).toBeTruthy();
    expect(marketApi.searchQuotesByPrefix).not.toHaveBeenCalled();
  });

  it('should NOT display favorite checkbox when user is authenticated', () => {
    const fixture = MockRender(SymbolSearchBasicComponent);
    const component = fixture.point.componentInstance;
    fixture.detectChanges();

    // get input field
    const inputField = ngMocks.find(fixture.debugElement, formFieldInputS);

    // focus on form field - opens overlay
    ngMocks.trigger(inputField, 'focus');

    fixture.detectChanges();

    const overlayContainer = ngMocks.get(OverlayContainer);
    const overlayContainerElement = overlayContainer.getContainerElement();
    const favoriteCheckbox = overlayContainerElement.querySelector(watchlistS);

    expect(component.isUserAuthenticatedSignal()).toBeTruthy();
    expect(favoriteCheckbox).toBeFalsy();
  });

  it('should display perform actions on symbol click', () => {
    const marketApi = ngMocks.get(MarketApiService);
    ngMocks.stub(marketApi, {
      searchQuotesByPrefix: jest.fn().mockReturnValue(of([quoteAAPLMock, quoteMSFTMock, quoteNFLXMock])),
    });

    ngMocks.flushTestBed();

    const fixture = MockRender(SymbolSearchBasicComponent, {
      openModalOnClick: true,
    });
    const component = fixture.point.componentInstance;
    fixture.detectChanges();

    const symbolSearchService = ngMocks.get(SymbolSearchService);
    const dialogService = ngMocks.get(MatDialog);

    // get input field
    const inputField = ngMocks.find(fixture.debugElement, formFieldInputS);

    // put some value into the input field
    inputField.nativeElement.value = 'AAPL';
    inputField.nativeElement.dispatchEvent(new Event('input'));

    // focus on form field - opens overlay
    ngMocks.trigger(inputField, 'focus');

    fixture.detectChanges();

    expect(component.searchValue()).toBe('AAPL');

    // get options
    const options = ngMocks.findAll(formSearchedResultsS);

    const onSummaryClickSpy = jest.spyOn(fixture.point.componentInstance, 'onSummaryClick');
    const clickedQuoteSpy = jest.spyOn(fixture.point.componentInstance.clickedQuote, 'emit');

    expect(options.length).toBe(3);
    expect(component.displayQuotes().type).toBe('searched');

    // click on first option
    ngMocks.click(options[0]);

    expect(component.displayQuotes().type).toBe('lastSearched');
    expect(component.openModalOnClick()).toBeTruthy();
    expect(onSummaryClickSpy).toHaveBeenCalledWith(quoteAAPLMock);
    expect(symbolSearchService.addSearchedSymbol).toHaveBeenCalledWith(quoteAAPLMock);
    expect(component.searchValue()).toBe('');
    expect(dialogService.open).toHaveBeenCalledWith(StockSummaryDialogComponent, expect.any(Object));
    expect(clickedQuoteSpy).toHaveBeenCalledWith(quoteAAPLMock);
  });

  it('should display NOT summary dialog on symbol click if disabled', () => {
    const fixture = MockRender(SymbolSearchBasicComponent, {
      openModalOnClick: false,
    });
    const component = fixture.point.componentInstance;
    fixture.detectChanges();

    const dialogService = ngMocks.get(MatDialog);

    // get input field
    const inputField = ngMocks.find(fixture.debugElement, formFieldInputS);

    // focus on form field - opens overlay
    ngMocks.trigger(inputField, 'focus');

    fixture.detectChanges();

    // get options
    const options = ngMocks.findAll(formSearchedResultsS);

    expect(options.length).toBe(2);
    expect(component.displayQuotes().type).toBe('lastSearched');

    const onSummaryClickSpy = jest.spyOn(fixture.point.componentInstance, 'onSummaryClick');
    const clickedQuoteSpy = jest.spyOn(fixture.point.componentInstance.clickedQuote, 'emit');

    // click on first option
    ngMocks.click(options[0]);

    expect(component.displayQuotes().type).toBe('lastSearched');
    expect(component.openModalOnClick()).toBeFalsy();
    expect(onSummaryClickSpy).toHaveBeenCalledWith(quoteDef1Mock);
    expect(component.searchValue()).toBe('');
    expect(dialogService.open).not.toHaveBeenCalled();
    expect(clickedQuoteSpy).toHaveBeenCalledWith(quoteDef1Mock);
  });

  describe('User in NOT Authenticated', () => {
    beforeAll(() => {
      authServiceMockValue = undefined;
    });

    it('should display favorite checkbox when user is NOT authenticated', () => {
      const fixture = MockRender(SymbolSearchBasicComponent);
      const component = fixture.point.componentInstance;
      fixture.detectChanges();

      // get input field
      const inputField = ngMocks.find(fixture.debugElement, formFieldInputS);

      // focus on form field - opens overlay
      ngMocks.trigger(inputField, 'focus');

      fixture.detectChanges();

      const overlayContainer = ngMocks.get(OverlayContainer);
      const overlayContainerElement = overlayContainer.getContainerElement();
      const overlayPane = overlayContainerElement.querySelector(overlayS);
      const favoriteCheckbox = overlayContainerElement.querySelector(watchlistS);

      expect(component.isUserAuthenticatedSignal()).toBeFalsy();
      expect(overlayPane).toBeTruthy();
      expect(favoriteCheckbox).toBeTruthy();
    });

    it('should NOT display favorite checkbox when user is NOT authenticated and search has value', () => {
      const fixture = MockRender(SymbolSearchBasicComponent);
      const component = fixture.point.componentInstance;
      fixture.detectChanges();

      // get input field
      const inputField = ngMocks.find(fixture.debugElement, formFieldInputS);

      // put some value into the input field
      inputField.nativeElement.value = 'AAPL';
      inputField.nativeElement.dispatchEvent(new Event('input'));

      // focus on form field - opens overlay
      ngMocks.trigger(inputField, 'focus');

      fixture.detectChanges();

      const overlayContainer = ngMocks.get(OverlayContainer);
      const overlayContainerElement = overlayContainer.getContainerElement();
      const overlayPane = overlayContainerElement.querySelector(overlayS);
      const favoriteCheckbox = overlayContainerElement.querySelector(watchlistS);

      expect(component.isUserAuthenticatedSignal()).toBeFalsy();
      expect(overlayPane).toBeTruthy();
      expect(favoriteCheckbox).toBeFalsy();
      expect(component.searchValue()).toBe('AAPL');
    });
  });
});
