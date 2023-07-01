import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarketOverviewComponent } from '../market-preview/market-preview.component';

describe('MarketOverviewComponent', () => {
  let component: MarketOverviewComponent;
  let fixture: ComponentFixture<MarketOverviewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarketOverviewComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(MarketOverviewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
