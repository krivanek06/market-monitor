import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PageMarketComponent } from './page-market.component';

describe('PageMarketComponent', () => {
  let component: PageMarketComponent;
  let fixture: ComponentFixture<PageMarketComponent>;

  beforeEach(async () => {
    MockBuilder(PageMarketComponent);

    fixture = MockRender(PageMarketComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
