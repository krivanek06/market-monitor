import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioRankTableComponent } from './portfolio-rank-table.component';

describe('PortfolioRankTableComponent', () => {
  let component: PortfolioRankTableComponent;
  let fixture: ComponentFixture<PortfolioRankTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PortfolioRankTableComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PortfolioRankTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
