import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { FormRegisterComponent } from './form-register.component';

describe('FormRegisterComponent', () => {
  let component: FormRegisterComponent;
  let fixture: ComponentFixture<FormRegisterComponent>;

  beforeEach(async () => {
    MockBuilder(FormRegisterComponent);

    fixture = MockRender(FormRegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
