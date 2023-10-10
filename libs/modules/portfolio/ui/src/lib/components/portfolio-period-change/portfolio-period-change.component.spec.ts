import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioPeriodChangeComponent } from './portfolio-period-change.component';

describe('PortfolioPeriodChangeComponent', () => {
  let component: PortfolioPeriodChangeComponent;
  let fixture: ComponentFixture<PortfolioPeriodChangeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PortfolioPeriodChangeComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioPeriodChangeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
