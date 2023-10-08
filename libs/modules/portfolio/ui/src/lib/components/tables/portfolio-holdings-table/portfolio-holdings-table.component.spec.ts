import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioHoldingsTableComponent } from './portfolio-holdings-table.component';

describe('PortfolioHoldingsTableComponent', () => {
  let component: PortfolioHoldingsTableComponent;
  let fixture: ComponentFixture<PortfolioHoldingsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PortfolioHoldingsTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioHoldingsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
