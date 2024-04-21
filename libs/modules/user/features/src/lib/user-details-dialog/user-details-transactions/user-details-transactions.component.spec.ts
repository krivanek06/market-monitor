import { ComponentRef } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { UserDetailsTransactionsComponent } from './user-details-transactions.component';

describe('UserDetailsTransactionsComponent', () => {
  let component: UserDetailsTransactionsComponent;
  let componentRef: ComponentRef<UserDetailsTransactionsComponent>;
  let fixture: ComponentFixture<UserDetailsTransactionsComponent>;

  beforeEach(async () => {
    MockBuilder(UserDetailsTransactionsComponent);

    fixture = MockRender(UserDetailsTransactionsComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
