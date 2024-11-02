import { signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatCheckbox, MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MarketApiService } from '@mm/api-client';
import {
  IsStockMarketOpenExtend,
  OutstandingOrder,
  PortfolioStateHoldings,
  UserAccountEnum,
  mockCreateUser,
} from '@mm/api-types';
import { AuthenticationUserStoreService } from '@mm/authentication/data-access';
import { UserAccountTypeDirective } from '@mm/authentication/feature-access-directive';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import {
  getCurrentDateDetailsFormat,
  getTransactionFees,
  getTransactionFeesBySpending,
  roundNDigits,
  transformUserToBaseMin,
} from '@mm/shared/general-util';
import { NumberKeyboardComponent } from '@mm/shared/ui';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { PortfolioTradeDialogComponent, PortfolioTradeDialogComponentData } from './portfolio-trade-dialog.component';

describe('PortfolioTradeDialogComponent', () => {
  const saveButtonS = '[data-testid="trade-dialog-save-button"]';
  const insufficientCashErrorS = '[data-testid="trade-dialog-insufficient-cash-error"]';
  const insufficientUnitsErrorS = '[data-testid="trade-dialog-insufficient-units-error"]';
  const sellAllCheckboxS = '[data-testid="trade-dialog-sell-all-checkbox"]';
  const unitsKeyboardCheckboxS = '[data-testid="trade-dialog-units-keyboard-checkbox"]';
  const valueKeyboardCheckboxS = '[data-testid="trade-dialog-value-keyboard-checkbox"]';
  const incrementUnitsButtonS = '[data-testid="trade-dialog-increment-units"]';
  const decrementUnitsButtonS = '[data-testid="trade-dialog-decrement-units"]';

  const mockData = {
    transactionType: 'BUY',
    quote: {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 120.0,
      timestamp: 1630000000,
      displaySymbol: 'AAPL',
    },
    sector: 'Technology',
  } as PortfolioTradeDialogComponentData;

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

  beforeEach(() => {
    return MockBuilder(PortfolioTradeDialogComponent)
      .keep(ReactiveFormsModule)
      .keep(MatCheckboxModule)
      .keep(NoopAnimationsModule)
      .keep(MatButtonModule)
      .keep(MatIconModule)
      .keep(UserAccountTypeDirective)
      .keep(NumberKeyboardComponent)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .provide({
        provide: MarketApiService,
        useValue: {
          getIsMarketOpenSignal: signal({
            currentHoliday: [] as string[],
            allHolidays: [] as string[],
          } as IsStockMarketOpenExtend),
        },
      })
      .provide({
        provide: MatDialogRef,
        useValue: {
          close: jest.fn(),
        },
      })
      .provide({
        provide: DialogServiceUtil,
        useValue: {
          handleError: jest.fn(),
          showNotificationBar: jest.fn(),
        },
      })
      .provide({
        provide: AuthenticationUserStoreService,
        useValue: {
          state: {
            getUserData: () => testUserData,
          } as AuthenticationUserStoreService['state'],
        },
      })
      .provide({
        provide: MAT_DIALOG_DATA,
        useValue: mockData,
      });
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should create', () => {
    const fixture = MockRender(PortfolioTradeDialogComponent);
    expect(fixture.point.componentInstance).toBeDefined();
  });

  it('should init symbolPriceOnDate with the provided quote price', () => {
    const fixture = MockRender(PortfolioTradeDialogComponent);
    const component = fixture.point.componentInstance;
    expect(component.data()).toBe(mockData);
  });

  it('should have default UNITS keyboard', () => {
    const fixture = MockRender(PortfolioTradeDialogComponent);
    const component = fixture.point.componentInstance;

    const keyBoard = ngMocks.find(NumberKeyboardComponent);
    const unitsKeyboardCheckboxEl = ngMocks.find<MatCheckbox>(unitsKeyboardCheckboxS);

    // check if exists
    expect(keyBoard).toBeTruthy();
    expect(unitsKeyboardCheckboxEl).toBeTruthy();
    expect(unitsKeyboardCheckboxEl.componentInstance.checked).toBe(true);
  });

  it('should switch to Custom Value keyboard and back to units', () => {
    const fixture = MockRender(PortfolioTradeDialogComponent);
    const component = fixture.point.componentInstance;

    const keyBoard = ngMocks.findInstance(NumberKeyboardComponent);
    const valueKeyboardCheckboxEl = ngMocks.find<MatCheckbox>(valueKeyboardCheckboxS);
    const unitsKeyboardCheckboxEl = ngMocks.find<MatCheckbox>(unitsKeyboardCheckboxS);

    // check if exists
    expect(keyBoard).toBeTruthy();
    expect(valueKeyboardCheckboxEl).toBeTruthy();
    expect(unitsKeyboardCheckboxEl).toBeTruthy();
    const onActiveTotalValueButtonChangeSpy = jest.spyOn(component, 'onActiveTotalValueButtonChange');

    // click element
    valueKeyboardCheckboxEl.nativeElement.click();

    // trigger CD
    fixture.detectChanges();

    // check if switched
    expect(onActiveTotalValueButtonChangeSpy).toHaveBeenCalledWith('TOTAL_VALUE');
    expect(keyBoard).toBeTruthy();
    expect(valueKeyboardCheckboxEl.componentInstance.checked).toBe(true);
    expect(unitsKeyboardCheckboxEl.componentInstance.checked).toBe(false);

    // todo - check when keyboard emit value it is set to custom value

    // switch back to units
    unitsKeyboardCheckboxEl.nativeElement.click();

    // trigger CD
    fixture.detectChanges();

    // check if switched
    expect(onActiveTotalValueButtonChangeSpy).toHaveBeenCalledWith('UNITS');
    expect(keyBoard).toBeTruthy();
    expect(valueKeyboardCheckboxEl.componentInstance.checked).toBe(false);
    expect(unitsKeyboardCheckboxEl.componentInstance.checked).toBe(true);

    // todo - check when keyboard emit value it is set to units
  });

  it('should remain on Custom Value keyboard if clicking multiple times', () => {
    const fixture = MockRender(PortfolioTradeDialogComponent);
    const component = fixture.point.componentInstance;

    const keyBoard = ngMocks.findInstance(NumberKeyboardComponent);
    const valueKeyboardCheckboxEl = ngMocks.find<MatCheckbox>(valueKeyboardCheckboxS);
    const unitsKeyboardCheckboxEl = ngMocks.find<MatCheckbox>(unitsKeyboardCheckboxS);

    const onActiveTotalValueButtonChangeSpy = jest.spyOn(component, 'onActiveTotalValueButtonChange');

    // check initial state
    expect(valueKeyboardCheckboxEl.componentInstance.checked).toBeFalsy();

    // click element
    valueKeyboardCheckboxEl.nativeElement.click();
    expect(component.form.controls.useCustomTotalValueControl.value).toBeTruthy();
    valueKeyboardCheckboxEl.nativeElement.click();
    expect(component.form.controls.useCustomTotalValueControl.value).toBeTruthy();
    valueKeyboardCheckboxEl.nativeElement.click();
    expect(component.form.controls.useCustomTotalValueControl.value).toBeTruthy();
    valueKeyboardCheckboxEl.nativeElement.click();

    // trigger CD
    fixture.detectChanges();

    // check if not switched
    expect(valueKeyboardCheckboxEl.componentInstance.checked).toBeTruthy();
    expect(unitsKeyboardCheckboxEl.componentInstance.checked).toBeFalsy();
    expect(valueKeyboardCheckboxEl.componentInstance.disabled).toBeTruthy();
    expect(unitsKeyboardCheckboxEl.componentInstance.disabled).toBeFalsy();
    expect(component.form.controls.useCustomTotalValueControl.value).toBeTruthy();
    expect(onActiveTotalValueButtonChangeSpy).toHaveBeenCalledWith('TOTAL_VALUE');
  });

  it('should remove increment units when setting custom value', () => {
    const fixture = MockRender(PortfolioTradeDialogComponent);
    const component = fixture.point.componentInstance;

    // all checkbox
    const valueKeyboardCheckboxEl = ngMocks.find<MatCheckbox>(valueKeyboardCheckboxS);
    const unitsKeyboardCheckboxEl = ngMocks.find<MatCheckbox>(unitsKeyboardCheckboxS);

    // check if exists
    expect(fixture.debugElement.query(By.css(decrementUnitsButtonS))).toBeTruthy();
    expect(fixture.debugElement.query(By.css(incrementUnitsButtonS))).toBeTruthy();

    // switch to custom value
    valueKeyboardCheckboxEl.nativeElement.click();

    // trigger CD
    fixture.detectChanges();

    // check if removed
    expect(fixture.debugElement.query(By.css(decrementUnitsButtonS))).toBeFalsy();
    expect(fixture.debugElement.query(By.css(incrementUnitsButtonS))).toBeFalsy();

    // switch back to units
    unitsKeyboardCheckboxEl.nativeElement.click();

    // trigger CD
    fixture.detectChanges();

    // check if exists
    expect(fixture.debugElement.query(By.css(decrementUnitsButtonS))).toBeTruthy();
    expect(fixture.debugElement.query(By.css(incrementUnitsButtonS))).toBeTruthy();
  });

  it('should calculate possible units to buy when setting custom value for stocks', () => {
    const fixture = MockRender(PortfolioTradeDialogComponent);
    const component = fixture.point.componentInstance;

    component.data.set({
      ...component.data(),
      userPortfolioStateHolding: { ...mockPortfolioState, cashOnHand: 1000 },
    });

    // use custom value
    const saveButtonEl = ngMocks.find<MatButton>(saveButtonS);
    const valueKeyboardCheckboxEl = ngMocks.find<MatCheckbox>(valueKeyboardCheckboxS);
    valueKeyboardCheckboxEl.nativeElement.click();

    // trigger CD
    fixture.detectChanges();

    // set custom value
    component.form.controls.customTotalValue.setValue(1000);
    const calculatedUnits = Math.floor(1000 / mockData.quote.price);
    const fees = getTransactionFees(mockData.quote.price, calculatedUnits);

    // trigger CD
    fixture.detectChanges();

    // check if not crypto
    expect(component.isSymbolCrypto()).toBe(false);

    // check if calculated
    expect(component.form.controls.units.value).toBe(calculatedUnits);

    // should be error because user does not have enough cash
    expect(component.insufficientCashErrorSignal()).toBe(false);

    // should have saved button disabled
    expect(saveButtonEl.nativeElement.disabled).toBe(false);
    expect(component.disabledSubmit()).toBe(false);

    // check how many units can be bought
    expect(component.calculatedFees()).toBe(fees);
    expect(component.maximumUnitsToBuy()).toBe(calculatedUnits);
  });

  it('should calculate possible units to buy when setting custom value for crypto', () => {
    const fixture = MockRender(PortfolioTradeDialogComponent);
    const component = fixture.point.componentInstance;

    // set data to crypto
    const cashTotal = 1100;
    component.data.set({
      ...component.data(),
      quote: {
        ...component.data().quote,
        exchange: 'CRYPTO',
      },
      userPortfolioStateHolding: { ...mockPortfolioState, cashOnHand: cashTotal },
    });

    expect(component.isSymbolCrypto()).toBe(true);

    // use custom value
    const saveButtonEl = ngMocks.find<MatButton>(saveButtonS);
    const valueKeyboardCheckboxEl = ngMocks.find<MatCheckbox>(valueKeyboardCheckboxS);
    valueKeyboardCheckboxEl.nativeElement.click();

    // trigger CD
    fixture.detectChanges();

    // set custom value
    const spending = 800;
    component.form.controls.customTotalValue.setValue(spending);

    const feesSpending = getTransactionFeesBySpending(spending);
    const feesTotal = getTransactionFeesBySpending(cashTotal);
    const calculatedUnits = roundNDigits(spending / mockData.quote.price, 4);
    const maxUnits = roundNDigits((1100 - feesTotal) / mockData.quote.price, 4);

    // trigger CD
    fixture.detectChanges();

    // check if calculated
    expect(component.form.controls.units.value).toBe(calculatedUnits);

    // should not be error
    expect(component.insufficientCashErrorSignal()).toBe(false);

    // should have saved button disabled
    expect(saveButtonEl.nativeElement.disabled).toBe(false);

    // check fees
    expect(component.calculatedFees()).toBe(feesSpending);

    // check how many units can be bought
    expect(component.maximumUnitsToBuy()).toBe(maxUnits);
  });

  it('should disable save button on BUY operation if we spend the full cash on hand, because fees would overflow by cash', () => {
    const fixture = MockRender(PortfolioTradeDialogComponent);
    const component = fixture.point.componentInstance;

    // set data to crypto
    const cashTotal = 1100;
    component.data.set({
      ...component.data(),
      quote: {
        ...component.data().quote,
        exchange: 'CRYPTO',
      },
      userPortfolioStateHolding: { ...mockPortfolioState, cashOnHand: cashTotal },
    });

    expect(component.isSymbolCrypto()).toBe(true);

    // use custom value
    const saveButtonEl = ngMocks.find<MatButton>(saveButtonS);
    const valueKeyboardCheckboxEl = ngMocks.find<MatCheckbox>(valueKeyboardCheckboxS);
    valueKeyboardCheckboxEl.nativeElement.click();

    // trigger CD
    fixture.detectChanges();

    // set custom value
    component.form.controls.customTotalValue.setValue(cashTotal);

    const feesTotal = getTransactionFeesBySpending(cashTotal);
    const calculatedUnits = roundNDigits(cashTotal / mockData.quote.price, 4);
    const maxUnits = roundNDigits((1100 - feesTotal) / mockData.quote.price, 4);

    // trigger CD
    fixture.detectChanges();

    // check if calculated
    expect(component.form.controls.units.value).toBe(calculatedUnits);

    // should not be error
    expect(component.insufficientCashErrorSignal()).toBe(true);

    // should have saved button disabled
    expect(saveButtonEl.nativeElement.disabled).toBe(true);

    // check fees
    expect(component.calculatedFees()).toBe(feesTotal);

    // check how many units can be bought
    expect(component.maximumUnitsToBuy()).toBe(maxUnits);
  });

  it('should nullify units and custom value when switching between them', () => {
    const fixture = MockRender(PortfolioTradeDialogComponent);
    const component = fixture.point.componentInstance;

    // all checkbox
    const valueKeyboardCheckboxEl = ngMocks.find<MatCheckbox>(valueKeyboardCheckboxS);
    const unitsKeyboardCheckboxEl = ngMocks.find<MatCheckbox>(unitsKeyboardCheckboxS);

    // set units
    component.form.controls.units.setValue(10);

    // switch to custom value
    valueKeyboardCheckboxEl.nativeElement.click();

    // trigger CD
    fixture.detectChanges();

    // check if nullified
    expect(component.form.controls.units.value).toBe(0);
    expect(component.form.controls.customTotalValue.value).toBe(0);

    // change custom value
    component.form.controls.customTotalValue.setValue(1000);

    // switch back to units
    unitsKeyboardCheckboxEl.nativeElement.click();

    // trigger CD
    fixture.detectChanges();

    // check if nullified
    expect(component.form.controls.customTotalValue.value).toBe(0);
    expect(component.form.controls.units.value).toBe(0);
  });

  describe('test form interaction', () => {
    it('should init form', () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;
      const form = {
        units: 0,
        customTotalValue: 0,
        useCustomTotalValueControl: false,
      };

      expect(component.form.value).toEqual(form);
    });

    it('should calculate fees on unit change', () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;

      const newUnits = 10;
      const expectedFees = getTransactionFees(mockData.quote.price, newUnits);

      // test initial value
      expect(component.calculatedFees()).toBe(0);

      // set units
      component.form.controls.units.setValue(newUnits);

      // test new units
      expect(component.calculatedFees()).toBe(expectedFees);
    });

    it('should reset units and total value on useCustomTotalValueControl change', () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;

      const newUnits = 10;
      const newTotalValue = 1000;

      // set units
      component.form.controls.units.setValue(newUnits);

      // test units
      expect(component.form.controls.units.value).toBe(newUnits);
      component.form.controls.useCustomTotalValueControl.setValue(true);
      expect(component.form.controls.units.value).toBe(0);

      // set total value
      component.form.controls.customTotalValue.setValue(newTotalValue);

      // test total value
      expect(component.form.controls.customTotalValue.value).toBe(newTotalValue);
      component.form.controls.useCustomTotalValueControl.setValue(true);
      expect(component.form.controls.customTotalValue.value).toBe(0);
    });

    it('should increment units by 1 when + button is clicked', () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;

      // grab sell all checkbox
      const incrementEl = ngMocks.find<MatButton>(incrementUnitsButtonS);

      // check if exists
      expect(incrementEl).toBeTruthy();

      // click element
      incrementEl.nativeElement.click();

      // trigger CD
      fixture.detectChanges();

      // test new state
      expect(component.form.controls.units.value).toBe(1);

      // click element
      incrementEl.nativeElement.click();

      // trigger CD
      fixture.detectChanges();

      // test new state
      expect(component.form.controls.units.value).toBe(2);
    });

    it('should decrement units by 1 when - button is clicked', () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;

      // grab sell all checkbox
      const decrementEl = fixture.debugElement.query(By.css(decrementUnitsButtonS));

      // check if exists
      expect(decrementEl).toBeTruthy();

      // set units default value
      component.form.controls.units.setValue(10);

      // click element
      decrementEl.nativeElement.click();

      // trigger CD
      fixture.detectChanges();

      // test new state
      expect(component.form.controls.units.value).toBe(9);

      // click element
      decrementEl.nativeElement.click();

      // trigger CD
      fixture.detectChanges();

      // test new state
      expect(component.form.controls.units.value).toBe(8);
    });

    it('should NOT decrement units by 1 when - button is clicked and units are 0', () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;

      // grab sell all checkbox
      const decrementEl = fixture.debugElement.query(By.css(decrementUnitsButtonS));

      // click element
      decrementEl.nativeElement.click();

      // trigger CD
      fixture.detectChanges();

      // test new state
      expect(component.form.controls.units.value).toBe(0);
    });

    it('should NOT enable decimal units for NOT CRYPTO', () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;
      const keyBoard = ngMocks.find(NumberKeyboardComponent);

      // check if crypto
      expect(component.isSymbolCrypto()).toBe(false);
      expect(keyBoard.componentInstance.enableDecimal()).toBe(false);
      expect(keyBoard.componentInstance.decimalLimit()).toBe(0);
    });

    it('should enable decimal units for CRYPTO', () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;
      const keyBoard = ngMocks.find(NumberKeyboardComponent);

      // change symbol type
      component.data.update((d) => ({
        ...d,
        quote: {
          ...d.quote,
          exchange: 'CRYPTO',
        },
        symbolType: 'CRYPTO',
      }));
      fixture.detectChanges();

      // check if crypto
      expect(component.isSymbolCrypto()).toBe(true);
      expect(keyBoard.componentInstance.enableDecimal()).toBe(true);
      expect(keyBoard.componentInstance.decimalLimit()).toBe(4);
    });
  });

  describe('test error validations', () => {
    it('should have initial state false errors and disabled submit', () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;

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
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;

      component.data.set({
        ...component.data(),
        // ser user cash to 0
        userPortfolioStateHolding: { ...mockPortfolioState, cashOnHand: 0 },
      });

      // trigger form change
      component.form.controls.units.setValue(10);

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
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;

      component.data.set({
        ...component.data(),
        transactionType: 'SELL',
        userPortfolioStateHolding: { ...mockPortfolioState, cashOnHand: 0 },
      });

      // trigger form change
      component.form.controls.units.setValue(10);

      // test new state
      expect(component.insufficientCashErrorSignal()).toBe(false);

      // trigger CD
      fixture.detectChanges();

      // check if error dix is present
      const cashErrorEl = fixture.debugElement.query(By.css(insufficientCashErrorS));

      expect(cashErrorEl).toBeFalsy();
    });

    it('should disable submit and show error on not enough units for SELL operation', () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;

      // test state
      expect(component.insufficientUnitsErrorSignal()).toBe(false);

      // change transaction type to SELL
      component.data().transactionType = 'SELL';

      // trigger form change
      component.form.controls.units.setValue(100);

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
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;

      // no holdings
      component.data.set({
        ...component.data(),
        transactionType: 'SELL',
        userPortfolioStateHolding: { ...mockPortfolioState, cashOnHand: 1000 },
      });

      // check if error dix is present
      const saveButtonEl = fixture.debugElement.query(By.css(saveButtonS));

      // by default disabled
      expect(saveButtonEl.nativeElement.disabled).toBe(true);

      // trigger form change
      component.form.controls.units.setValue(2);

      // trigger CD
      fixture.detectChanges();

      // enabled save button
      expect(saveButtonEl.nativeElement.disabled).toBe(false);

      // trigger form change
      component.form.controls.units.setValue(0);

      // trigger CD
      fixture.detectChanges();

      // disable save button - units are 0
      expect(saveButtonEl.nativeElement.disabled).toBe(true);
    });
  });

  describe('test BUY operations', () => {
    it('should not display sell all checkbox on BUY operation', () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;

      // change transaction type to SELL
      component.data.update((d) => ({
        ...d,
        transactionType: 'BUY',
      }));
      fixture.detectChanges();

      // grab sell all checkbox
      const sellAllCheckboxEl = fixture.debugElement.query(By.css(sellAllCheckboxS));

      // not present
      expect(sellAllCheckboxEl).toBeFalsy();
    });
  });

  describe('test SELL operations', () => {
    it('should display sell all checkbox on SELL operation', () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;

      // change transaction type to SELL
      component.data.update((d) => ({
        ...d,
        transactionType: 'SELL',
      }));
      fixture.detectChanges();

      // grab sell all checkbox
      const sellAllCheckboxEl = ngMocks.find<MatCheckbox>(sellAllCheckboxS);

      // check if exists
      expect(sellAllCheckboxEl).toBeTruthy();
    });

    it('should NOT display units and custom value checkboxes', () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;

      // change transaction type to SELL
      component.data.update((d) => ({
        ...d,
        transactionType: 'SELL',
      }));
      fixture.detectChanges();

      // grab sell all checkbox
      const unitsKeyboardCheckboxEl = fixture.debugElement.query(By.css(unitsKeyboardCheckboxS));
      const valueKeyboardCheckboxEl = fixture.debugElement.query(By.css(valueKeyboardCheckboxS));

      // not present
      expect(unitsKeyboardCheckboxEl).toBeFalsy();
      expect(valueKeyboardCheckboxEl).toBeFalsy();
    });

    it('should pull all units when sell all is checked', () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;

      // change transaction type to SELL
      component.data.update((d) => ({
        ...d,
        transactionType: 'SELL',
        userPortfolioStateHolding: {
          ...mockPortfolioState,
          cashOnHand: 1000,
        },
      }));
      fixture.detectChanges();

      // grab sell all checkbox
      const sellAllCheckboxEl = ngMocks.find<MatCheckbox>(sellAllCheckboxS);

      // check if exists
      expect(sellAllCheckboxEl).toBeTruthy();

      // by default disabled
      expect(sellAllCheckboxEl.componentInstance.checked).toBe(false);
      expect(component.form.controls.units.value).toBe(0);

      const onSellAllClickSpy = jest.spyOn(component, 'onSellAllClick');

      // check checkbox
      sellAllCheckboxEl.componentInstance.toggle();

      // maybe not the best, but I want to trigger the 'change' event from checkbox
      const change = new MatCheckboxChange();
      change.source = sellAllCheckboxEl.componentInstance;
      change.checked = sellAllCheckboxEl.componentInstance.checked;
      sellAllCheckboxEl.componentInstance.change.emit(change);

      // trigger CD
      fixture.detectChanges();

      // check if changed
      expect(onSellAllClickSpy).toHaveBeenCalled();
      expect(sellAllCheckboxEl.componentInstance.checked).toBe(true);
      expect(component.form.controls.units.value).toBe(mockPortfolioState.holdings[0].units);

      // uncheck checkbox
      sellAllCheckboxEl.componentInstance.toggle();
      change.checked = sellAllCheckboxEl.componentInstance.checked;
      sellAllCheckboxEl.componentInstance.change.emit(change);

      // trigger CD
      fixture.detectChanges();

      // check if changed
      expect(onSellAllClickSpy).toHaveBeenCalledTimes(2);
      expect(sellAllCheckboxEl.componentInstance.checked).toBe(false);
      expect(component.form.controls.units.value).toBe(0);
    });
  });

  describe('test: onFormSubmit()', () => {
    it('should not allow submit if custom value not set', async () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;

      component.form.controls.useCustomTotalValueControl.setValue(true);

      await component.onFormSubmit();

      const saveButtonEl = ngMocks.find<MatButton>(saveButtonS);
      expect(saveButtonEl.nativeElement.disabled).toBe(true);
    });

    it('should create transaction based on form value', async () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;
      const dialog = ngMocks.get(MatDialogRef);

      component.data.set({
        ...component.data(),
        transactionType: 'BUY',
        userPortfolioStateHolding: { ...mockPortfolioState, cashOnHand: 10_000 },
      });

      const expectedResult: OutstandingOrder = {
        createdAt: getCurrentDateDetailsFormat(),
        symbol: mockData.quote.symbol,
        units: 10,
        symbolType: 'STOCK',
        sector: mockData.sector ?? 'Unknown',
        displaySymbol: mockData.quote.displaySymbol,
        orderId: expect.any(String),
        orderType: {
          type: 'BUY',
        },
        potentialSymbolPrice: mockData.quote.price,
        potentialTotalPrice: mockData.quote.price * 10,
        status: 'OPEN',
        userData: transformUserToBaseMin(testUserData),
      };

      // set units
      component.form.controls.units.setValue(10);

      // trigger CD
      fixture.detectChanges();

      // submit form
      await component.onFormSubmit();

      expect(component.disabledSubmit()).toBe(false);
      expect(dialog.close).toHaveBeenCalledWith(expectedResult);
    });

    it('should create transaction by clicking on the UI', async () => {
      const fixture = MockRender(PortfolioTradeDialogComponent);
      const component = fixture.point.componentInstance;
      const dialogRef = ngMocks.get(MatDialogRef);

      const incrementEl = ngMocks.find<MatButton>(incrementUnitsButtonS);
      const saveButtonEl = fixture.debugElement.query(By.css(saveButtonS));

      component.data.set({
        ...component.data(),
        transactionType: 'BUY',
        userPortfolioStateHolding: { ...mockPortfolioState, cashOnHand: 10_000 },
      });

      // set 2 units
      incrementEl.nativeElement.click();
      incrementEl.nativeElement.click();

      // trigger CD
      fixture.detectChanges();

      // submit form
      saveButtonEl.nativeElement.click();

      const expectedResult: OutstandingOrder = {
        createdAt: getCurrentDateDetailsFormat(),
        symbol: mockData.quote.symbol,
        units: 2,
        symbolType: 'STOCK',
        sector: mockData.sector ?? 'Unknown',
        displaySymbol: mockData.quote.displaySymbol,
        orderId: expect.any(String),
        orderType: {
          type: 'BUY',
        },
        potentialSymbolPrice: mockData.quote.price,
        potentialTotalPrice: mockData.quote.price * 2,
        status: 'OPEN',
        userData: transformUserToBaseMin(testUserData),
      };

      expect(component.disabledSubmit()).toBe(false);
      expect(dialogRef.close).toHaveBeenCalledWith(expectedResult);
    });
  });
});
