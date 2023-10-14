import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioStateTransactionsComponent } from './portfolio-state-transactions.component';

describe('PortfolioStateTransactionsComponent', () => {
  let component: PortfolioStateTransactionsComponent;
  let fixture: ComponentFixture<PortfolioStateTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PortfolioStateTransactionsComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioStateTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
