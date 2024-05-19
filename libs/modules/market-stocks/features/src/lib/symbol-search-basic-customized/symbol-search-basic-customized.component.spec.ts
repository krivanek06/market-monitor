import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { SymbolSearchBasicCustomizedComponent } from './symbol-search-basic-customized.component';

describe('SymbolSearchBasicCustomizedComponent', () => {
  let component: SymbolSearchBasicCustomizedComponent;
  let fixture: ComponentFixture<SymbolSearchBasicCustomizedComponent>;

  beforeEach(async () => {
    MockBuilder(SymbolSearchBasicCustomizedComponent);

    fixture = MockRender(SymbolSearchBasicCustomizedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
