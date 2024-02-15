import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { UserSearchControlComponent } from './user-search-control.component';

describe('UserSearchControlComponent', () => {
  let component: UserSearchControlComponent;
  let fixture: ComponentFixture<UserSearchControlComponent>;

  beforeEach(() => {
    MockBuilder(UserSearchControlComponent);

    fixture = MockRender(UserSearchControlComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
