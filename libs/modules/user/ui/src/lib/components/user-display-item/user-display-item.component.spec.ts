import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { UserDisplayItemComponent } from './user-display-item.component';

describe('UserDisplayItemComponent', () => {
  let component: UserDisplayItemComponent;
  let fixture: ComponentFixture<UserDisplayItemComponent>;

  beforeEach(() => {
    MockBuilder(UserDisplayItemComponent);

    fixture = MockRender(UserDisplayItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
