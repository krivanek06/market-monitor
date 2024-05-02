import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { DropdownControlComponent } from './dropdown-control.component';

describe('DropdownControlComponent', () => {
  let component: DropdownControlComponent<string>;
  let fixture: ComponentFixture<DropdownControlComponent<string>>;

  beforeEach(async () => {
    MockBuilder(DropdownControlComponent);

    fixture = MockRender(DropdownControlComponent);

    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
