import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StockEnterpriseChartComponent } from './stock-enterprise-chart.component';

describe('StockEnterpriseChartComponent', () => {
  let component: StockEnterpriseChartComponent;
  let fixture: ComponentFixture<StockEnterpriseChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StockEnterpriseChartComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(StockEnterpriseChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
