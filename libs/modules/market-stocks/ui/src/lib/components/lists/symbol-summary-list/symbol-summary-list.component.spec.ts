import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { SymbolSummaryListComponent } from './symbol-summary-list.component';

describe('SymbolSummaryListComponent', () => {
  let component: SymbolSummaryListComponent;
  let fixture: ComponentFixture<SymbolSummaryListComponent>;

  beforeEach(async () => {
    MockBuilder(SymbolSummaryListComponent);

    fixture = MockRender(SymbolSummaryListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
