import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioTransactionsTableComponent } from './portfolio-transactions-table.component';

describe('PortfolioTransactionsTableComponent', () => {
  let component: PortfolioTransactionsTableComponent;
  let fixture: ComponentFixture<PortfolioTransactionsTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PortfolioTransactionsTableComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioTransactionsTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
