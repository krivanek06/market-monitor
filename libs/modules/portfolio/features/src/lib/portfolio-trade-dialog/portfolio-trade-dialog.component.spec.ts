import { HarnessLoader } from '@angular/cdk/testing';
import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonHarness } from '@angular/material/button/testing';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCheckboxHarness } from '@angular/material/checkbox/testing';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MarketApiService } from '@mm/api-client';
import {
  HistoricalPrice,
  IsStockMarketOpenExtend,
  PortfolioStateHoldings,
  PortfolioTransactionCreate,
  TRANSACTION_FEE_PRCT,
  UserAccountEnum,
  mockCreateUser,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { UserAccountTypeDirective } from '@mm/authentication/feature-access-directive';
import { PortfolioUserFacadeService } from '@mm/portfolio/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { dateFormatDate, getCurrentDateDetailsFormat, roundNDigits } from '@mm/shared/general-util';
import { DatePickerComponent } from '@mm/shared/ui';
import { MockBuilder, MockProvider, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { of, throwError } from 'rxjs';
import { PortfolioTradeDialogComponent, PortfolioTradeDialogComponentData } from './portfolio-trade-dialog.component';

const saveButtonS = '[data-testid="trade-dialog-save-button"]';
const insufficientCashErrorS = '[data-testid="trade-dialog-insufficient-cash-error"]';
const insufficientUnitsErrorS = '[data-testid="trade-dialog-insufficient-units-error"]';
const maxHoldingErrorS = '[data-testid="trade-dialog-max-holdings-error"]';
const sellAllCheckboxS = '[data-testid="trade-dialog-sell-all-checkbox"]';
const incrementUnitsButtonS = '[data-testid="trade-dialog-increment-units"]';
const decrementUnitsButtonS = '[data-testid="trade-dialog-decrement-units"]';
const datePickerS = '[data-testid="trade-dialog-date-picker"]';

const mockData = {
  transactionType: 'BUY',
  quote: {
    symbol: 'AAPL',
    name: 'Apple Inc.',
    price: 150.0,
    timestamp: 1630000000,
  },
  sector: 'Technology',
} as PortfolioTradeDialogComponentData;

const mockClosedPrice = {
  close: 120,
  date: '2021-01-01',
  volume: 10_000,
} as HistoricalPrice;

describe('PortfolioTradeDialogComponent', () => {
  let component: PortfolioTradeDialogComponent;
  let fixture: ComponentFixture<PortfolioTradeDialogComponent>;
  let loader: HarnessLoader;

  const testUserData = mockCreateUser({
    userAccountType: UserAccountEnum.DEMO_TRADING,
  });

  const mockPortfolioState = {
    balance: 1000,
    cashOnHand: 500,
    invested: 300,
    holdingsBalance: 500,
    holdings: [
      {
        symbol: 'AAPL',
        units: 10,
        breakEvenPrice: 100,
        invested: 1000,
        sector: 'Technology',
        weight: 1,
        symbolType: 'STOCK',
      },
    ] as PortfolioStateHoldings['holdings'],
  } as PortfolioStateHoldings;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        PortfolioTradeDialogComponent,
        ReactiveFormsModule,
        MatCheckboxModule,
        NoopAnimationsModule,
        MatButtonModule,
        UserAccountTypeDirective,
      ],
      providers: [
        MockProvider(MarketApiService, {
          getHistoricalPricesOnDate: jest.fn().mockReturnValue(of(mockClosedPrice)),
          getIsMarketOpenSignal: signal({
            currentHoliday: [] as string[],
            allHolidays: [] as string[],
          } as IsStockMarketOpenExtend),
        }),
        MockProvider(MatDialogRef, {
          close: jest.fn(),
        }),
        MockProvider(PortfolioUserFacadeService, {
          getPortfolioStateHolding: jest.fn().mockReturnValue(signal(mockPortfolioState.holdings[0])),
          getPortfolioState: signal(mockPortfolioState),
          createPortfolioOperation: jest.fn().mockReturnValue(Promise.resolve({} as PortfolioTransactionCreate)),
        }),
        MockProvider(DialogServiceUtil, {
          handleError: jest.fn(),
          showNotificationBar: jest.fn(),
        }),
        MockProvider(AuthenticationUserStoreService, {
          state: {
            getUserData: () => testUserData,
            isAccountDemoTrading: () => true,
          } as AuthenticationUserStoreService['state'],
        }),
        MockProvider(MAT_DIALOG_DATA, mockData),
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioTradeDialogComponent);
    component = fixture.componentInstance;
    loader = TestbedHarnessEnvironment.loader(fixture);
    fixture.detectChanges();
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  beforeAll(() => {
    // freezing time
    jest.useFakeTimers().setSystemTime(new Date(getCurrentDateDetailsFormat()));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should create', () => {
    expect(fixture).toBeDefined();
  });

  it('should init symbolPriceOnDate with the provided quote price', () => {
    expect(component.symbolPriceOnDate()).toBe(mockData.quote.price);
  });

  describe('test form interaction', () => {
    it('should init form', () => {
      const form = {
        date: new Date(mockData.quote.timestamp * 1000),
        units: '',
        customTotalValue: '',
        useCustomTotalValueControl: false,
      };

      expect(component.form.value).toEqual(form);
    });

    it('should load historical price if date changes', () => {
      const marketApi = ngMocks.get(MarketApiService);
      const dialogUtil = ngMocks.get(DialogServiceUtil);

      // by default is not called
      expect(marketApi.getHistoricalPricesOnDate).not.toHaveBeenCalled();

      // trigger date
      component.form.controls.date.setValue(new Date());

      expect(marketApi.getHistoricalPricesOnDate).toHaveBeenCalled();
      expect(component.symbolPriceOnDate()).toBe(mockClosedPrice.close);

      // mock response to get error
      ngMocks.stub(marketApi, {
        getHistoricalPricesOnDate: jest.fn().mockReturnValue(throwError(() => new Error('error'))),
      });

      // trigger date
      component.form.controls.date.setValue(new Date());

      expect(marketApi.getHistoricalPricesOnDate).toHaveBeenCalled();
      expect(component.symbolPriceOnDate()).toBe(0);
      expect(dialogUtil.handleError).toHaveBeenCalled();
    });

    it('should calculate fees on unit change', () => {
      const newUnits = 10;
      const expectedFees = roundNDigits(((newUnits * mockData.quote.price) / 100) * TRANSACTION_FEE_PRCT);

      // test initial value
      expect(component.calculatedFees()).toBe(0);

      // set units
      component.form.controls.units.setValue(String(newUnits));

      // test new units
      expect(component.calculatedFees()).toBe(expectedFees);
    });

    it('should reset units and total value on useCustomTotalValueControl change', () => {
      const newUnits = 10;
      const newTotalValue = 1000;

      // set units
      component.form.controls.units.setValue(String(newUnits));

      // set total value
      component.form.controls.customTotalValue.setValue(String(newTotalValue));

      // test initial value
      expect(component.form.controls.units.value).toBe(String(newUnits));
      expect(component.form.controls.customTotalValue.value).toBe(String(newTotalValue));

      // set useCustomTotalValueControl
      component.form.controls.useCustomTotalValueControl.setValue(true);

      // test new value
      expect(component.form.controls.units.value).toBe('');
      expect(component.form.controls.customTotalValue.value).toBe('');
    });

    it('should increment units by 1 when + button is clicked', async () => {
      // grab sell all checkbox
      const incrementEl = await loader.getHarness(MatButtonHarness.with({ selector: incrementUnitsButtonS }));

      // check if exists
      expect(incrementEl).toBeTruthy();

      // click element
      await incrementEl.click();

      // trigger CD
      fixture.detectChanges();

      // test new state
      expect(component.form.controls.units.value).toBe('1');

      // click element
      await incrementEl.click();

      // trigger CD
      fixture.detectChanges();

      // test new state
      expect(component.form.controls.units.value).toBe('2');
    });

    it('should decrement units by 1 when - button is clicked', () => {
      // grab sell all checkbox
      const decrementEl = fixture.debugElement.query(By.css(decrementUnitsButtonS));

      // check if exists
      expect(decrementEl).toBeTruthy();

      // set units default value
      component.form.controls.units.setValue('10');

      // click element
      decrementEl.nativeElement.click();

      // trigger CD
      fixture.detectChanges();

      // test new state
      expect(component.form.controls.units.value).toBe('9');

      // click element
      decrementEl.nativeElement.click();

      // trigger CD
      fixture.detectChanges();

      // test new state
      expect(component.form.controls.units.value).toBe('8');
    });

    it('should NOT decrement units by 1 when - button is clicked and units are 0', () => {
      // grab sell all checkbox
      const decrementEl = fixture.debugElement.query(By.css(decrementUnitsButtonS));

      // click element
      decrementEl.nativeElement.click();

      // trigger CD
      fixture.detectChanges();

      // test new state
      expect(component.form.controls.units.value).toBe('0');
    });
  });

  describe('test error validations', () => {
    it('should have initial state false errors and disabled submit', () => {
      // trigger CD
      fixture.detectChanges();

      // initial state is false
      expect(component.insufficientCashErrorSignal()).toBe(false);
      expect(component.insufficientUnitsErrorSignal()).toBe(false);

      // check if error dix is present
      const cashErrorEl = fixture.debugElement.query(By.css(insufficientCashErrorS));
      const unitsErrorEl = fixture.debugElement.query(By.css(insufficientUnitsErrorS));
      const saveButtonEl = fixture.debugElement.query(By.css(saveButtonS));

      expect(cashErrorEl).toBeFalsy();
      expect(unitsErrorEl).toBeFalsy();
      expect(saveButtonEl.nativeElement.disabled).toBe(true);
    });

    it('should disable submit and show error on insufficient cash', () => {
      const portfolioService = ngMocks.get(PortfolioUserFacadeService);

      // ser user cash to 0
      ngMocks.stub(portfolioService, {
        getPortfolioState: signal({ ...mockPortfolioState, cashOnHand: 0 }),
      });

      // trigger form change
      component.form.controls.units.setValue('10');

      // test new state
      expect(component.insufficientCashErrorSignal()).toBe(true);

      // trigger CD
      fixture.detectChanges();

      // check if error dix is present
      const cashErrorEl = fixture.debugElement.query(By.css(insufficientCashErrorS));
      const saveButtonEl = fixture.debugElement.query(By.css(saveButtonS));

      expect(cashErrorEl).toBeTruthy();
      expect(saveButtonEl.nativeElement.disabled).toBe(true);
    });

    it('should NOT display error on sufficient cash for SELL operation', () => {
      const portfolioService = ngMocks.get(PortfolioUserFacadeService);

      // ser user cash to 0
      ngMocks.stub(portfolioService, {
        getPortfolioState: signal({ ...mockPortfolioState, cashOnHand: 0 }),
      });

      // change transaction type to SELL
      component.data().transactionType = 'SELL';

      // trigger form change
      component.form.controls.units.setValue('10');

      // test new state
      expect(component.insufficientCashErrorSignal()).toBe(false);

      // trigger CD
      fixture.detectChanges();

      // check if error dix is present
      const cashErrorEl = fixture.debugElement.query(By.css(insufficientCashErrorS));

      expect(cashErrorEl).toBeFalsy();
    });

    it('should NOT display error on sufficient cash is user is not in DEMO_TRADING mode', () => {
      const authUser = ngMocks.get(AuthenticationUserStoreService);
      const portfolioService = ngMocks.get(PortfolioUserFacadeService);

      // check if error dix is present
      const cashErrorEl = fixture.debugElement.query(By.css(insufficientCashErrorS));
      const saveButtonEl = fixture.debugElement.query(By.css(saveButtonS));

      // trigger CD
      fixture.detectChanges();

      expect(cashErrorEl).toBeFalsy();
      expect(saveButtonEl.nativeElement.disabled).toBe(true);

      // set user to be normal account
      ngMocks.stub(authUser, {
        state: {
          getUserData: () =>
            mockCreateUser({
              userAccountType: UserAccountEnum.NORMAL_BASIC,
            }),
          isAccountDemoTrading: () => false,
        } as AuthenticationUserStoreService['state'],
      });

      // ser user cash to 0
      ngMocks.stub(portfolioService, {
        getPortfolioState: signal({ ...mockPortfolioState, cashOnHand: 0 }),
      });

      // trigger form change
      component.form.controls.units.setValue('8');

      // test new state
      expect(component.insufficientCashErrorSignal()).toBe(false);

      // trigger CD
      fixture.detectChanges();

      expect(cashErrorEl).toBeFalsy();
      expect(saveButtonEl.nativeElement.disabled).toBe(false);
    });

    it('should disable submit and show error on not enough units for SELL operation', () => {
      // test state
      expect(component.insufficientUnitsErrorSignal()).toBe(false);

      // change transaction type to SELL
      component.data().transactionType = 'SELL';

      // trigger form change
      component.form.controls.units.setValue('100');

      // trigger CD
      fixture.detectChanges();

      // test new state
      expect(component.insufficientUnitsErrorSignal()).toBe(true);

      // check if error dix is present
      const unitsErrorEl = fixture.debugElement.query(By.css(insufficientUnitsErrorS));
      const saveButtonEl = fixture.debugElement.query(By.css(saveButtonS));

      expect(unitsErrorEl).toBeTruthy();
      expect(saveButtonEl.nativeElement.disabled).toBe(true);
    });

    it('should disable save button when units reach to 0', () => {
      // check if error dix is present
      const saveButtonEl = fixture.debugElement.query(By.css(saveButtonS));

      // by default disabled
      expect(saveButtonEl.nativeElement.disabled).toBe(true);

      // trigger form change
      component.form.controls.units.setValue('2');

      // trigger CD
      fixture.detectChanges();

      // enabled save button
      expect(saveButtonEl.nativeElement.disabled).toBe(false);

      // trigger form change
      component.form.controls.units.setValue('0');

      // trigger CD
      fixture.detectChanges();

      // disable save button - units are 0
      expect(saveButtonEl.nativeElement.disabled).toBe(true);
    });
  });

  describe('test BUY operations', () => {
    beforeEach(() => {
      // change transaction type to SELL
      component.data.update((d) => ({
        ...d,
        transactionType: 'BUY',
      }));

      // trigger CD
      fixture.detectChanges();
    });

    it('should not display sell all checkbox on BUY operation', () => {
      // grab sell all checkbox
      const sellAllCheckboxEl = fixture.debugElement.query(By.css(sellAllCheckboxS));

      // not present
      expect(sellAllCheckboxEl).toBeFalsy();
    });
  });

  describe('test SELL operations', () => {
    beforeEach(() => {
      // change transaction type to SELL
      component.data.update((d) => ({
        ...d,
        transactionType: 'SELL',
      }));

      // trigger CD
      fixture.detectChanges();
    });

    it('should pull all units when sell all is checked', async () => {
      // grab sell all checkbox
      const sellAllCheckboxEl = await loader.getHarness(MatCheckboxHarness.with({ selector: sellAllCheckboxS }));

      // check if exists
      expect(sellAllCheckboxEl).toBeTruthy();

      // by default disabled
      expect(await sellAllCheckboxEl.isChecked()).toBe(false);

      // check checkbox
      await sellAllCheckboxEl.toggle();

      // trigger CD
      fixture.detectChanges();

      // check if changed
      expect(await sellAllCheckboxEl.isChecked()).toBe(true);
      expect(component.form.controls.units.value).toBe(String(mockPortfolioState.holdings[0].units));

      // uncheck checkbox
      await sellAllCheckboxEl.toggle();

      // trigger CD
      fixture.detectChanges();

      // check if changed
      expect(await sellAllCheckboxEl.isChecked()).toBe(false);
      expect(component.form.controls.units.value).toBe('');
    });
  });

  describe('test: onFormSubmit()', () => {
    it('should notify user on invalid form', async () => {
      await component.onFormSubmit();

      expect(ngMocks.get(DialogServiceUtil).showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'error');
    });

    it('should notify user if custom total value is missing', async () => {
      component.form.controls.useCustomTotalValueControl.setValue(true);

      await component.onFormSubmit();

      expect(ngMocks.get(DialogServiceUtil).showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'error');
    });

    it('should show error message if creating transaction fails', async () => {
      const dialogUtil = ngMocks.get(DialogServiceUtil);
      const portfolioService = ngMocks.get(PortfolioUserFacadeService);

      // mock error
      ngMocks.stub(portfolioService, {
        createPortfolioOperation: jest.fn().mockRejectedValue('error happened'),
      });

      // set units
      component.form.controls.units.setValue('10');

      // trigger CD
      fixture.detectChanges();

      // submit form
      await component.onFormSubmit();

      expect(portfolioService.createPortfolioOperation).toHaveBeenCalled();
      expect(dialogUtil.handleError).toHaveBeenCalled();
      expect(component.isLoadingSignal()).toBe(false);
    });

    it('should create transaction based on form value', async () => {
      const dialogUtil = ngMocks.get(DialogServiceUtil);
      const portfolioService = ngMocks.get(PortfolioUserFacadeService);

      const expectedResult: PortfolioTransactionCreate = {
        date: dateFormatDate(mockData.quote.timestamp * 1000, 'yyyy-MM-dd HH:mm:ss'),
        symbol: mockData.quote.symbol,
        units: 10,
        customTotalValue: undefined,
        transactionType: mockData.transactionType,
        symbolType: 'STOCK',
        sector: mockData.sector ?? 'Unknown',
      };

      // set units
      component.form.controls.units.setValue('10');

      // trigger CD
      fixture.detectChanges();

      // submit form
      await component.onFormSubmit();

      expect(portfolioService.createPortfolioOperation).toHaveBeenCalled();
      expect(portfolioService.createPortfolioOperation).toHaveBeenCalledWith(expectedResult);
      expect(dialogUtil.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'success');
      expect(component.isLoadingSignal()).toBe(false);
    });

    it('should create transaction by clicking on the UI', async () => {
      const dialogUtil = ngMocks.get(DialogServiceUtil);
      const portfolioService = ngMocks.get(PortfolioUserFacadeService);
      const dialogRef = ngMocks.get(MatDialogRef);

      const incrementEl = await loader.getHarness(MatButtonHarness.with({ selector: incrementUnitsButtonS }));
      const saveButtonEl = fixture.debugElement.query(By.css(saveButtonS));

      // set 2 units
      await incrementEl.click();
      await incrementEl.click();

      // trigger CD
      fixture.detectChanges();

      // submit form
      await saveButtonEl.nativeElement.click();

      const expectedResult: PortfolioTransactionCreate = {
        date: dateFormatDate(mockData.quote.timestamp * 1000, 'yyyy-MM-dd HH:mm:ss'),
        symbol: mockData.quote.symbol,
        units: 2,
        customTotalValue: undefined,
        transactionType: mockData.transactionType,
        symbolType: 'STOCK',
        sector: mockData.sector ?? 'Unknown',
      };

      expect(dialogRef.close).toHaveBeenCalled();
      expect(portfolioService.createPortfolioOperation).toHaveBeenCalled();
      expect(portfolioService.createPortfolioOperation).toHaveBeenCalledWith(expectedResult);
      expect(dialogUtil.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'success');
      expect(component.isLoadingSignal()).toBe(false);
    });
  });

  it('should NOT display a calendar', () => {
    const datePickerEl = fixture.debugElement.query(By.css(datePickerS));

    // check if exists
    expect(datePickerEl).toBeFalsy();
  });
});

// ------------------------------------------------------------------------------------------------------------------------

describe('PortfolioTradeDialogComponent: Normal User Type', () => {
  const testUserData = mockCreateUser({
    userAccountType: UserAccountEnum.NORMAL_BASIC,
  });

  const mockPortfolioState = {
    balance: 1000,
    cashOnHand: 500,
    invested: 300,
    holdingsBalance: 500,
    holdings: [
      {
        symbol: 'AAPL',
        units: 10,
        breakEvenPrice: 100,
        invested: 1000,
        sector: 'Technology',
        weight: 1,
        symbolType: 'STOCK',
      },
    ] as PortfolioStateHoldings['holdings'],
  } as PortfolioStateHoldings;

  beforeEach(() => {
    return MockBuilder(PortfolioTradeDialogComponent)
      .keep(ReactiveFormsModule)
      .keep(NoopAnimationsModule)
      .keep(UserAccountTypeDirective)
      .keep(MatCheckboxModule)
      .keep(MatButtonModule)
      .keep(NG_MOCKS_ROOT_PROVIDERS) // used this because keeping mat modules
      .mock(MatDialogModule)
      .mock(DatePickerComponent)
      .mock(DialogServiceUtil)
      .mock(MatDialogRef, {
        close: jest.fn(),
      })
      .provide({
        provide: MarketApiService,
        useValue: {
          getHistoricalPricesOnDate: jest.fn().mockReturnValue(of(mockClosedPrice)),
          getIsMarketOpenSignal: signal({
            currentHoliday: [] as string[],
            allHolidays: [] as string[],
          } as IsStockMarketOpenExtend),
        },
      })
      .provide({
        provide: PortfolioUserFacadeService,
        useValue: {
          getPortfolioStateHolding: jest.fn().mockReturnValue(signal(mockPortfolioState.holdings[0])),
          getPortfolioState: signal(mockPortfolioState),
          createPortfolioOperation: jest.fn().mockReturnValue(Promise.resolve({} as PortfolioTransactionCreate)),
        },
      })
      .provide({
        provide: AuthenticationUserStoreService,
        useValue: {
          state: {
            getUserData: () => testUserData,
            isAccountDemoTrading: () => false,
            isAccountNormalBasic: () => true,
          } as AuthenticationUserStoreService['state'],
        },
      })
      .provide({ provide: MAT_DIALOG_DATA, useValue: mockData });
  });

  afterEach(() => {
    ngMocks.flushTestBed();
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  beforeAll(() => {
    // freezing time
    jest.useFakeTimers().setSystemTime(new Date(getCurrentDateDetailsFormat()));
  });

  afterAll(() => {
    jest.useRealTimers();
  });

  it('should create', () => {
    const fixture = MockRender(PortfolioTradeDialogComponent);
    expect(fixture).toBeDefined();
  });

  it('should display any element on UI', () => {
    const fixture = MockRender(PortfolioTradeDialogComponent);
    const randomEl = ngMocks.find(incrementUnitsButtonS, { fixture: fixture });
    const randomEl2 = fixture.debugElement.query(By.css(incrementUnitsButtonS));
    const randomEl3 = ngMocks.find(fixture.debugElement, incrementUnitsButtonS);

    expect(randomEl).toBeTruthy();
    expect(randomEl2).toBeTruthy();
    expect(randomEl3).toBeTruthy();
  });

  it('should have calendar date picker on the screen', () => {
    const fixture = MockRender(PortfolioTradeDialogComponent);

    const datePickerEl = ngMocks.find(fixture.debugElement, datePickerS);

    // check if exists
    expect(datePickerEl).toBeTruthy();
  });
});
