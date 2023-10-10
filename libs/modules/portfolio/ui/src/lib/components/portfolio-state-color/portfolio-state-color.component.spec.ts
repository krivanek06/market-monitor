import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PortfolioStateColorComponent } from './portfolio-state-color.component';

describe('PortfolioStateColorComponent', () => {
  let component: PortfolioStateColorComponent;
  let fixture: ComponentFixture<PortfolioStateColorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ PortfolioStateColorComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PortfolioStateColorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
