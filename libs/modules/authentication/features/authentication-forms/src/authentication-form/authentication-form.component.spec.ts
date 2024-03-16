import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { AuthenticationFormComponent } from './authentication-form.component';

describe('AuthenticationFormComponent', () => {
  let component: AuthenticationFormComponent;
  let fixture: ComponentFixture<AuthenticationFormComponent>;

  beforeEach(async () => {
    MockBuilder(AuthenticationFormComponent);

    fixture = MockRender(AuthenticationFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
