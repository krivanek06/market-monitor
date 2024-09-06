import { TestbedHarnessEnvironment } from '@angular/cdk/testing/testbed';
import { signal } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { MatButton, MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTabHarness } from '@angular/material/tabs/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Router } from '@angular/router';
import { UserAccountEnum, UserDataDemoData, mockCreateUser } from '@mm/api-types';
import {
  AuthenticationAccountService,
  AuthenticationUserStoreService,
  LoginUserInput,
  RegisterUserInput,
} from '@mm/authentication/data-access';
import { ROUTES_MAIN } from '@mm/shared/data-access';
import { DialogServiceUtil } from '@mm/shared/dialog-manager';
import { LocalStorageData, StorageLocalService } from '@mm/shared/storage-local';
import { UserCredential } from 'firebase/auth';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS, ngMocks } from 'ng-mocks';
import { of } from 'rxjs';
import { AuthenticationFormComponent } from './authentication-form.component';
import { FormLoginComponent } from './form-login/form-login.component';
import { FormLoginComponentMock } from './form-login/form-login.mock.component';
import { FormRegisterComponent } from './form-register/form-register.component';
import { FormRegisterMockComponent } from './form-register/form-register.mock.component';

describe('AuthenticationFormComponent', () => {
  const loginFormS = '[data-testid="auth-form-login-form"]';
  const googleLoginButtonS = '[data-testid="auth-form-google-auth-button"]';
  const demoLoginButtonS = '[data-testid="auth-form-demo-login-button"]';
  const registrationFormS = '[data-testid="auth-form-registration-form"]';
  const spinnerS = '[data-testid="auth-form-spinner"]';

  const userMockAuth = mockCreateUser({
    id: 'USER_1',
    userAccountType: UserAccountEnum.DEMO_TRADING,
  });

  const userMockCredentials = {
    user: {
      email: userMockAuth.personal.email,
      displayName: userMockAuth.personal.displayName,
    },
  } as UserCredential;

  const userDemoMock = {
    password: 'test123',
    userData: userMockAuth,
  } as UserDataDemoData;

  beforeEach(() => {
    return MockBuilder(AuthenticationFormComponent)
      .keep(ReactiveFormsModule)
      .keep(NoopAnimationsModule)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .keep(MatButtonModule)
      .keep(MatTabsModule)
      .keep(MatProgressSpinnerModule)
      .replace(FormLoginComponent, FormLoginComponentMock)
      .replace(FormRegisterComponent, FormRegisterMockComponent)
      .provide({
        provide: AuthenticationAccountService,
        useValue: {
          signInGoogle: jest.fn().mockResolvedValue(userMockCredentials),
          getUserData: jest.fn().mockReturnValue(of(userMockAuth)),
          isUserNewUser: signal(true),
          registerDemoAccount: jest.fn().mockResolvedValue(userDemoMock),
          signIn: jest.fn().mockResolvedValue(userMockCredentials),
          register: jest.fn().mockResolvedValue(userMockCredentials),
        },
      })
      .provide({
        provide: StorageLocalService,
        useValue: {
          localData: () => ({
            demoAccount: undefined,
          }),
          saveData: jest.fn(),
        },
      })
      .provide({
        provide: AuthenticationUserStoreService,
        useValue: {
          resetTransactions: jest.fn().mockResolvedValue(true),
        },
      })
      .provide({
        provide: DialogServiceUtil,
        useValue: {
          showNotificationBar: jest.fn(),
          showConfirmDialog: jest.fn().mockResolvedValue(true),
          handleError: jest.fn(),
        },
      })
      .provide({
        provide: Router,
        useValue: {
          navigate: jest.fn(),
        },
      });
  });

  afterEach(() => {
    ngMocks.reset();
    ngMocks.autoSpy('reset');
  });

  it('should create', () => {
    const fixture = MockRender(AuthenticationFormComponent);
    expect(fixture.point.componentInstance).toBeTruthy();
  });

  it('should display login or registration form by tab selection', async () => {
    const fixture = MockRender(AuthenticationFormComponent);
    fixture.detectChanges();

    const loader = TestbedHarnessEnvironment.loader(fixture);
    const tabs = await loader.getAllHarnesses(MatTabHarness);

    // check if there are 2 tabs
    expect(tabs.length).toBe(2);

    // check that users are displayed by default
    const firstTab = await tabs[0].getLabel();
    expect(firstTab).toBe('Login');

    // check if login form is displayed by default
    expect(fixture.debugElement.query(By.css(loginFormS))).toBeTruthy();
    expect(fixture.debugElement.query(By.css(googleLoginButtonS))).toBeTruthy();
    expect(fixture.debugElement.query(By.css(demoLoginButtonS))).toBeTruthy();
    expect(fixture.debugElement.query(By.css(registrationFormS))).toBeFalsy();
    expect(fixture.debugElement.query(By.css(spinnerS))).toBeFalsy();

    // switch to registration form
    await tabs[1].select();
    fixture.detectChanges();

    // check that registration form is displayed
    expect(fixture.debugElement.query(By.css(loginFormS))).toBeFalsy();
    expect(fixture.debugElement.query(By.css(googleLoginButtonS))).toBeFalsy();
    expect(fixture.debugElement.query(By.css(demoLoginButtonS))).toBeFalsy();
    expect(fixture.debugElement.query(By.css(registrationFormS))).toBeTruthy();
  });

  it('should login user on correct credentials', async () => {
    const fixture = MockRender(AuthenticationFormComponent);
    const component = fixture.point.componentInstance;

    // render ui
    fixture.detectChanges();

    const loginCredentials: LoginUserInput = {
      email: 'test123@test.com',
      password: 'test123',
    };

    const authenticationAccountService = ngMocks.get(AuthenticationAccountService);
    const router = ngMocks.get(Router);
    const dialogUtil = ngMocks.get(DialogServiceUtil);

    // login form component emits
    const loginFormComponent = ngMocks.find<FormLoginComponentMock>(loginFormS);
    loginFormComponent.componentInstance.onChange(loginCredentials);

    // check if login credentials are passed to the service
    expect(authenticationAccountService.signIn).toHaveBeenCalledWith(loginCredentials);
    expect(authenticationAccountService.signIn).toHaveBeenCalledTimes(1);
    expect(component.userAuthenticationState()).toEqual({
      action: 'loading',
      data: null,
    });

    fixture.detectChanges();

    // check if spinner is displayed
    expect(fixture.debugElement.query(By.css(spinnerS))).toBeTruthy();

    // wait for the service to resolve
    await fixture.whenStable();
    fixture.detectChanges();

    expect(authenticationAccountService.getUserData).toHaveBeenCalledTimes(1);

    // check final state
    expect(component.userAuthenticationState()).toEqual({
      action: 'success',
      data: userMockAuth,
    });

    // check if user is redirected
    expect(router.navigate).toHaveBeenCalledWith([ROUTES_MAIN.DASHBOARD]);
    expect(dialogUtil.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'success');
  });

  it('should not login user if error happens', async () => {
    // stub service to reject login
    const authenticationAccountService = ngMocks.get(AuthenticationAccountService);
    ngMocks.stub(authenticationAccountService, {
      ...authenticationAccountService,
      signIn: jest.fn().mockRejectedValue(new Error('Invalid credentials')),
    });

    ngMocks.flushTestBed();

    // create component
    const fixture = MockRender(AuthenticationFormComponent);
    const component = fixture.point.componentInstance;
    fixture.detectChanges();

    const dialog = ngMocks.get(DialogServiceUtil);
    const router = ngMocks.get(Router);

    // login form component emits
    const loginFormComponent = ngMocks.find<FormLoginComponentMock>(loginFormS);
    loginFormComponent.componentInstance.onChange({
      email: 'test123@test.com',
      password: 'test123',
    } as LoginUserInput);

    // wait for the service to resolve
    await fixture.whenStable();
    fixture.detectChanges();

    // check if error is handled
    expect(authenticationAccountService.getUserData).toHaveBeenCalledTimes(0);
    expect(component.userAuthenticationState()).toEqual({
      action: 'error',
      data: null,
      error: expect.any(Error),
    });
    expect(dialog.handleError).toHaveBeenCalledWith(expect.any(Error));
    expect(router.navigate).toHaveBeenCalledTimes(0);
  });

  it('should register user on correct credentials', async () => {
    const fixture = MockRender(AuthenticationFormComponent);
    const component = fixture.point.componentInstance;

    // render ui
    fixture.detectChanges();

    const authenticationAccountService = ngMocks.get(AuthenticationAccountService);
    const router = ngMocks.get(Router);
    const dialogUtil = ngMocks.get(DialogServiceUtil);
    const store = ngMocks.get(AuthenticationUserStoreService);

    // switch tab to registration
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const tabs = await loader.getAllHarnesses(MatTabHarness);
    await tabs[1].select();

    const registerCredentials = {
      email: 'test@test.com',
      password: 'test123',
    } as RegisterUserInput;

    // register form component emits
    const registerFormComponent = ngMocks.find<FormRegisterMockComponent>(registrationFormS);
    registerFormComponent.componentInstance.onChange(registerCredentials);

    // check if services are called
    expect(authenticationAccountService.register).toHaveBeenCalledWith(registerCredentials);
    expect(authenticationAccountService.register).toHaveBeenCalledTimes(1);
    expect(component.userAuthenticationState()).toEqual({
      action: 'loading',
      data: null,
    });

    // spy on selecting account type
    const openSelectAccountTypeSpy = jest.spyOn(component, 'openSelectAccountType');

    // wait for the service to resolve
    await fixture.whenStable();
    fixture.detectChanges();

    expect(authenticationAccountService.getUserData).toHaveBeenCalledTimes(1);
    expect(openSelectAccountTypeSpy).toHaveBeenCalledTimes(1);
    expect(store.resetTransactions).toHaveBeenCalledTimes(1);
    expect(store.resetTransactions).toHaveBeenCalledWith(UserAccountEnum.DEMO_TRADING);
    expect(component.userAuthenticationState()).toEqual({
      action: 'success',
      data: userMockAuth,
    });
    expect(dialogUtil.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'success');
    expect(router.navigate).toHaveBeenCalledWith([ROUTES_MAIN.DASHBOARD]);
  });

  it('should not register user if error happens', async () => {
    // stub service to reject login
    const authenticationAccountService = ngMocks.get(AuthenticationAccountService);
    ngMocks.stub(authenticationAccountService, {
      ...authenticationAccountService,
      register: jest.fn().mockRejectedValue(new Error('Invalid credentials')),
    });
    ngMocks.flushTestBed();

    // create component
    const fixture = MockRender(AuthenticationFormComponent);
    const component = fixture.point.componentInstance;

    // render ui
    fixture.detectChanges();

    const router = ngMocks.get(Router);
    const dialogUtil = ngMocks.get(DialogServiceUtil);
    const store = ngMocks.get(AuthenticationUserStoreService);

    // switch tab to registration
    const loader = TestbedHarnessEnvironment.loader(fixture);
    const tabs = await loader.getAllHarnesses(MatTabHarness);
    await tabs[1].select();

    const registerCredentials = {
      email: 'test@test.com',
      password: 'test123',
    } as RegisterUserInput;

    // register form component emits
    const registerFormComponent = ngMocks.find<FormRegisterMockComponent>(registrationFormS);
    registerFormComponent.componentInstance.onChange(registerCredentials);

    // check if services are called
    expect(authenticationAccountService.register).toHaveBeenCalledWith(registerCredentials);
    expect(authenticationAccountService.register).toHaveBeenCalledTimes(1);

    // spy on selecting account type
    const openSelectAccountTypeSpy = jest.spyOn(component, 'openSelectAccountType');

    // wait for the service to resolve
    await fixture.whenStable();
    fixture.detectChanges();

    expect(authenticationAccountService.getUserData).not.toHaveBeenCalled();
    expect(openSelectAccountTypeSpy).not.toHaveBeenCalled();
    expect(store.resetTransactions).not.toHaveBeenCalled();
    expect(component.userAuthenticationState()).toEqual({
      action: 'error',
      data: null,
      error: expect.any(Error),
    });
    expect(dialogUtil.handleError).toHaveBeenCalledWith(expect.any(Error));
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should create demo account on demo login', async () => {
    const fixture = MockRender(AuthenticationFormComponent);
    const component = fixture.point.componentInstance;

    const authenticationAccountService = ngMocks.get(AuthenticationAccountService);
    const router = ngMocks.get(Router);
    const dialogUtil = ngMocks.get(DialogServiceUtil);
    const storageLocalService = ngMocks.get(StorageLocalService);

    const openSelectAccountTypeSpy = jest.spyOn(component, 'openSelectAccountType');

    // click on demo login button
    const demoLoginButton = ngMocks.find<MatButton>(demoLoginButtonS);
    demoLoginButton.nativeElement.click();

    // wait for the service to resolve
    await fixture.whenStable();
    fixture.detectChanges();

    // check if correct services are called
    expect(openSelectAccountTypeSpy).toHaveBeenCalledTimes(1);
    expect(dialogUtil.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'notification', 5000);
    expect(authenticationAccountService.registerDemoAccount).toHaveBeenCalledTimes(1);
    expect(authenticationAccountService.registerDemoAccount).toHaveBeenCalledWith(UserAccountEnum.DEMO_TRADING);
    expect(dialogUtil.showConfirmDialog).toHaveBeenCalledWith(expect.any(String));
    expect(authenticationAccountService.signIn).toHaveBeenCalledTimes(1);
    expect(authenticationAccountService.signIn).toHaveBeenCalledWith({
      email: userDemoMock.userData.personal.email,
      password: userDemoMock.password,
    });
    expect(component.userAuthenticationState()).toEqual({
      action: 'success',
      data: userMockAuth,
    });
    expect(dialogUtil.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'success');
    expect(router.navigate).toHaveBeenCalledWith([ROUTES_MAIN.DASHBOARD]);

    // check if demo account is saved in local storage
    expect(storageLocalService.saveData).toHaveBeenCalledWith('demoAccount', {
      email: userDemoMock.userData.personal.email,
      password: userDemoMock.password,
      createdDate: expect.any(String),
    });

    // check that demo account does not exist
    expect(component.demoAccount()).toBeUndefined();
    expect(component.demoAccountValid()).toBeFalsy();
  });

  it('should login by demo account if it is active', async () => {
    // add demo account to local storage
    const storageLocalService = ngMocks.get(StorageLocalService);
    ngMocks.stub(storageLocalService, {
      ...storageLocalService,
      localData: signal({
        demoAccount: {
          email: userDemoMock.userData.personal.email,
          password: userDemoMock.password,
          createdDate: new Date().toISOString(),
        },
      } as LocalStorageData),
    });

    ngMocks.flushTestBed();

    // create component
    const fixture = MockRender(AuthenticationFormComponent);
    const component = fixture.point.componentInstance;
    const dialogServiceUtil = ngMocks.get(DialogServiceUtil);
    const authenticationAccountService = ngMocks.get(AuthenticationAccountService);
    const router = ngMocks.get(Router);

    // click on demo login button
    const demoLoginButton = ngMocks.find<MatButton>(demoLoginButtonS);
    demoLoginButton.nativeElement.click();

    // wait for the service to resolve
    await fixture.whenStable();
    fixture.detectChanges();

    // check if correct services are called
    expect(dialogServiceUtil.showConfirmDialog).not.toHaveBeenCalled();
    expect(authenticationAccountService.signIn).toHaveBeenCalledWith({
      email: userDemoMock.userData.personal.email,
      password: userDemoMock.password,
    });
    expect(component.userAuthenticationState()).toEqual({
      action: 'success',
      data: userMockAuth,
    });
    expect(dialogServiceUtil.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'success');
    expect(router.navigate).toHaveBeenCalledWith([ROUTES_MAIN.DASHBOARD]);
    // check that demo account does exist
    expect(component.demoAccount()).toEqual({
      email: userDemoMock.userData.personal.email,
      password: userDemoMock.password,
      createdDate: expect.any(String),
    });
    expect(component.demoAccountValid()).toBeTruthy();
  });

  it('should remove demo account if receives error from server', async () => {
    // add demo account to local storage
    const storageLocalService = ngMocks.get(StorageLocalService);
    const authenticationAccountService = ngMocks.get(AuthenticationAccountService);

    // add demo account to local storage
    ngMocks.stub(storageLocalService, {
      ...storageLocalService,
      localData: signal({
        demoAccount: {
          email: userDemoMock.userData.personal.email,
          password: userDemoMock.password,
          createdDate: new Date().toISOString(),
        },
      } as LocalStorageData),
    });

    // add error when signing in
    ngMocks.stub(authenticationAccountService, {
      ...authenticationAccountService,
      signIn: jest.fn().mockRejectedValue(new Error('Invalid credentials')),
    });

    ngMocks.flushTestBed();

    // create component
    const fixture = MockRender(AuthenticationFormComponent);
    const component = fixture.point.componentInstance;
    const dialogServiceUtil = ngMocks.get(DialogServiceUtil);
    const router = ngMocks.get(Router);

    // wait for the service to resolve
    await fixture.whenStable();
    fixture.detectChanges();

    // check that demo account does exist
    expect(component.demoAccount()).toEqual({
      email: userDemoMock.userData.personal.email,
      password: userDemoMock.password,
      createdDate: expect.any(String),
    });
    expect(component.demoAccountValid()).toBeTruthy();

    // click on demo login button
    const demoLoginButton = ngMocks.find<MatButton>(demoLoginButtonS);
    demoLoginButton.nativeElement.click();

    // wait for the service to resolve
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.userAuthenticationState().action).toBe('error-demo-already-active');
    expect(dialogServiceUtil.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'error');
    expect(storageLocalService.saveData).toHaveBeenCalledWith('demoAccount', undefined);
    expect(router.navigate).not.toHaveBeenCalled();
  });

  it('should not create demo account if server error happens', async () => {
    // stub service to reject login
    const authenticationAccountService = ngMocks.get(AuthenticationAccountService);
    ngMocks.stub(authenticationAccountService, {
      ...authenticationAccountService,
      registerDemoAccount: jest.fn().mockRejectedValue(new Error('Invalid credentials')),
    });
    ngMocks.flushTestBed();

    // create component
    const fixture = MockRender(AuthenticationFormComponent);
    const component = fixture.point.componentInstance;

    const router = ngMocks.get(Router);
    const dialogUtil = ngMocks.get(DialogServiceUtil);

    const openSelectAccountTypeSpy = jest.spyOn(component, 'openSelectAccountType');

    // click on demo login button
    const demoLoginButton = ngMocks.find<MatButton>(demoLoginButtonS);
    demoLoginButton.nativeElement.click();

    // wait for the service to resolve
    await fixture.whenStable();
    fixture.detectChanges();

    // check if correct services are called
    expect(openSelectAccountTypeSpy).toHaveBeenCalledTimes(1);
    expect(dialogUtil.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'notification', 5000);
    expect(authenticationAccountService.registerDemoAccount).toHaveBeenCalledTimes(1);
    expect(authenticationAccountService.registerDemoAccount).toHaveBeenCalledWith(UserAccountEnum.DEMO_TRADING);
    expect(dialogUtil.showConfirmDialog).toHaveBeenCalledWith(expect.any(String));
    expect(authenticationAccountService.signIn).not.toHaveBeenCalled();
    expect(component.userAuthenticationState()).toEqual({
      action: 'error',
      data: null,
      error: expect.any(Error),
    });
    expect(dialogUtil.handleError).toHaveBeenCalledWith(expect.any(Error));
    expect(dialogUtil.showNotificationBar).not.toHaveBeenCalledWith(expect.any(String), 'success');
    expect(router.navigate).not.toHaveBeenCalledWith([ROUTES_MAIN.DASHBOARD]);
  });

  it('should create an account on google login if user does exist', async () => {
    // create component
    const fixture = MockRender(AuthenticationFormComponent);
    const component = fixture.point.componentInstance;

    const router = ngMocks.get(Router);
    const dialogUtil = ngMocks.get(DialogServiceUtil);
    const authenticationAccountService = ngMocks.get(AuthenticationAccountService);
    const store = ngMocks.get(AuthenticationUserStoreService);

    const openSelectAccountTypeSpy = jest.spyOn(component, 'openSelectAccountType');

    // click on google login button
    const googleLoginButton = ngMocks.find<MatButton>(googleLoginButtonS);
    googleLoginButton.nativeElement.click();

    // check if correct services are called
    expect(openSelectAccountTypeSpy).toHaveBeenCalledTimes(1);
    expect(authenticationAccountService.signInGoogle).toHaveBeenCalledTimes(1);
    expect(store.resetTransactions).toHaveBeenCalledTimes(1);
    expect(store.resetTransactions).toHaveBeenCalledWith(UserAccountEnum.DEMO_TRADING);
    expect(dialogUtil.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'success');
    expect(router.navigate).toHaveBeenCalledWith([ROUTES_MAIN.DASHBOARD]);
    expect(component.userAuthenticationState()).toEqual({
      action: 'success',
      data: userMockAuth,
    });
  });

  it('should not create an account on google login if user already exists', async () => {
    // stub service that user already exists
    const authenticationAccountService = ngMocks.get(AuthenticationAccountService);
    ngMocks.stub(authenticationAccountService, {
      ...authenticationAccountService,
      isUserNewUser: signal(false),
    });
    ngMocks.flushTestBed();

    // create component
    const fixture = MockRender(AuthenticationFormComponent);
    const component = fixture.point.componentInstance;

    const router = ngMocks.get(Router);
    const dialogUtil = ngMocks.get(DialogServiceUtil);
    const store = ngMocks.get(AuthenticationUserStoreService);

    const openSelectAccountTypeSpy = jest.spyOn(component, 'openSelectAccountType');

    // click on google login button
    const googleLoginButton = ngMocks.find<MatButton>(googleLoginButtonS);
    googleLoginButton.nativeElement.click();

    // check if correct services are called
    expect(openSelectAccountTypeSpy).not.toHaveBeenCalled();
    expect(authenticationAccountService.signInGoogle).toHaveBeenCalledTimes(1);
    expect(store.resetTransactions).not.toHaveBeenCalled();
    expect(dialogUtil.showNotificationBar).toHaveBeenCalledWith(expect.any(String), 'success');
    expect(router.navigate).toHaveBeenCalledWith([ROUTES_MAIN.DASHBOARD]);
    expect(component.userAuthenticationState()).toEqual({
      action: 'success',
      data: userMockAuth,
    });
  });
});
