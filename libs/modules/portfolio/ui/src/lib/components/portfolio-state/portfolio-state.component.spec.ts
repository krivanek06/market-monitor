import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioStateComponent } from './portfolio-state.component';

describe('PortfolioStateComponent', () => {
  let component: PortfolioStateComponent;
  let fixture: ComponentFixture<PortfolioStateComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PortfolioStateComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioStateComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
