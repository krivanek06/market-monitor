import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PageTradingComponent } from './page-trading.component';

describe('PageTradingComponent', () => {
  let component: PageTradingComponent;
  let fixture: ComponentFixture<PageTradingComponent>;

  beforeEach(async () => {
    MockBuilder(PageTradingComponent);

    fixture = MockRender(PageTradingComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
