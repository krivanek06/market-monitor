import { ComponentFixture } from '@angular/core/testing';
import { MockBuilder, MockRender } from 'ng-mocks';
import { PortfolioStateComponent } from './portfolio-state.component';

describe('PortfolioStateComponent', () => {
  let component: PortfolioStateComponent;
  let fixture: ComponentFixture<PortfolioStateComponent>;

  beforeEach(async () => {
    MockBuilder(PortfolioStateComponent);

    fixture = MockRender(PortfolioStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
