import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioTradeDialogComponent } from './portfolio-trade-dialog.component';

describe('PortfolioTradeDialogComponent', () => {
  let component: PortfolioTradeDialogComponent;
  let fixture: ComponentFixture<PortfolioTradeDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PortfolioTradeDialogComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioTradeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
