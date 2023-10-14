import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioStateRiskComponent } from './portfolio-state-risk.component';

describe('PortfolioStateRiskComponent', () => {
  let component: PortfolioStateRiskComponent;
  let fixture: ComponentFixture<PortfolioStateRiskComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PortfolioStateRiskComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioStateRiskComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
