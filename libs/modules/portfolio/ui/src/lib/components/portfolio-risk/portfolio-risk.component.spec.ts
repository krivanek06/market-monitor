import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioRiskComponent } from './portfolio-risk.component';

describe('PortfolioRiskComponent', () => {
  let component: PortfolioRiskComponent;
  let fixture: ComponentFixture<PortfolioRiskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PortfolioRiskComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioRiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
