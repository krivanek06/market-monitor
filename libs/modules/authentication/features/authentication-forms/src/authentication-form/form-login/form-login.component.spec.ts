import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { FormLoginComponent } from './form-login.component';

describe('FormLoginComponent', () => {
  let component: FormLoginComponent;
  let fixture: ComponentFixture<FormLoginComponent>;

  beforeEach(async () => {
    MockBuilder(FormLoginComponent);

    fixture = MockRender(FormLoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
