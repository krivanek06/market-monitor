import { ComponentRef } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { mockCreateUser } from '@mm/api-types';
import { MockBuilder, MockRender } from 'ng-mocks';
import { UserDetailsPortfolioComponent } from './user-details-portfolio.component';

describe('UserDetailsPortfolioComponent', () => {
  let component: UserDetailsPortfolioComponent;
  let componentRef: ComponentRef<UserDetailsPortfolioComponent>;
  let fixture: ComponentFixture<UserDetailsPortfolioComponent>;

  const userData = mockCreateUser();

  beforeEach(async () => {
    MockBuilder(UserDetailsPortfolioComponent);

    fixture = MockRender(UserDetailsPortfolioComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;

    // set required inputs
    componentRef.setInput('portfolioGrowth', []);
    componentRef.setInput('userData', userData);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
