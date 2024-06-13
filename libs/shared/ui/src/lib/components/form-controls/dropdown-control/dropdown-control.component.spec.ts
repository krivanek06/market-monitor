import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { MockBuilder, MockRender, NG_MOCKS_ROOT_PROVIDERS } from 'ng-mocks';
import { DropdownControlComponent } from './dropdown-control.component';

describe('DropdownControlComponent', () => {
  beforeEach(() => {
    return MockBuilder(DropdownControlComponent)
      .keep(NG_MOCKS_ROOT_PROVIDERS)
      .keep(NoopAnimationsModule)
      .keep(ReactiveFormsModule)
      .keep(MatSelectModule)
      .keep(MatAutocompleteModule)
      .keep(MatInputModule)
      .keep(MatFormFieldModule)
      .keep(FormsModule)
      .keep(MatButtonModule);
  });

  it('should create', () => {
    const fixture = MockRender(DropdownControlComponent, {
      inputCaption: '',
    });
    expect(fixture.point.componentInstance).toBeTruthy();
  });
});
