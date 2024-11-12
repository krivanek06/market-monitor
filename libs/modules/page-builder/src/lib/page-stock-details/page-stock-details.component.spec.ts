import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PageStockDetailsComponent } from './page-stock-details.component';

describe('PageStockDetailsComponent', () => {
  let component: PageStockDetailsComponent;
  let fixture: ComponentFixture<PageStockDetailsComponent>;

  beforeEach(async () => {
    MockBuilder(PageStockDetailsComponent);

    fixture = MockRender(PageStockDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
